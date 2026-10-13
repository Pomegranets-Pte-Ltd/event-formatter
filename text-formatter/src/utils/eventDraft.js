const DATABASE_NAME = 'text-formatter-drafts'
const STORE_NAME = 'drafts'
const DRAFT_KEY = 'event'
export const DRAFT_LIFETIME = 24 * 60 * 60 * 1000
let databasePromise

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error('Draft storage is blocked.'))
      request.onsuccess = () => {
        const database = request.result
        database.onversionchange = () => {
          database.close()
          databasePromise = undefined
        }
        resolve(database)
      }
    }).catch((error) => {
      databasePromise = undefined
      throw error
    })
  }
  return databasePromise
}

async function accessDraft(mode, action) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = action(transaction.objectStore(STORE_NAME))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onabort = () => reject(transaction.error || new Error('Draft storage failed.'))
    transaction.onerror = () => reject(transaction.error)
  })
}

export function createDraftRecord({ form, routers, networks, expandedRouterId }, now = Date.now()) {
  return {
    version: 1,
    updatedAt: now,
    form: { ...form },
    routers: routers.map((router) => ({
      ...router,
      speedTests: router.speedTests.map(({ id, label, image }) => ({
        id,
        label,
        image: image ? { file: image.file, name: image.name, crop: image.crop } : null,
      })),
    })),
    networks: networks.map((network) => ({ ...network })),
    expandedRouterId,
  }
}

function hasStrings(value, fields) {
  return value && fields.every((field) => typeof value[field] === 'string')
}

function hasUniqueIds(items, allowEmpty = false) {
  return Array.isArray(items) && (allowEmpty || items.length > 0) &&
    items.every((item) => Number.isSafeInteger(item?.id) && item.id > 0) &&
    new Set(items.map((item) => item.id)).size === items.length
}

export function readDraftRecord(record, now = Date.now()) {
  if (!record) return null
  if (!Number.isFinite(record.updatedAt) || now - record.updatedAt >= DRAFT_LIFETIME) return null
  if (
    record.version !== 1 ||
    !hasStrings(record.form, ['eventName', 'statusUpdate', 'collectionDate', 'collectionTime', 'notes']) ||
    !['Setup done', 'Collection done'].includes(record.form.statusUpdate) ||
    !hasUniqueIds(record.routers) || !hasUniqueIds(record.networks) ||
    !record.networks.every((network) => hasStrings(network, ['ssid', 'password'])) ||
    !record.routers.every((router) =>
      hasStrings(router, ['model', 'routerId', 'mode', 'provider', 'switchPorts', 'switchSerialNumber', 'location']) &&
      typeof router.includeSwitch === 'boolean' &&
      hasUniqueIds(router.accessPoints, true) &&
      router.accessPoints.every((ap) => hasStrings(ap, ['serialNumber'])) &&
      hasUniqueIds(router.speedTests) &&
      router.speedTests.every((test) => hasStrings(test, ['label']) &&
        (test.image === null || (
          test.image?.file instanceof Blob && test.image.file.type.startsWith('image/') &&
          typeof test.image.name === 'string'
        ))),
    )
  ) throw new Error('The saved draft could not be read.')

  return {
    form: record.form,
    routers: record.routers,
    networks: record.networks,
    expandedRouterId: record.expandedRouterId === null || record.routers.some((router) => router.id === record.expandedRouterId)
      ? record.expandedRouterId : record.routers[0].id,
  }
}

export async function loadEventDraft() {
  const record = await accessDraft('readonly', (store) => store.get(DRAFT_KEY))
  const draft = readDraftRecord(record)
  if (record && !draft) await clearEventDraft()
  return draft
}

export function saveEventDraft(draft) {
  const record = createDraftRecord(draft)
  return accessDraft('readwrite', (store) => store.put(record, DRAFT_KEY))
}

export function clearEventDraft() {
  return accessDraft('readwrite', (store) => store.delete(DRAFT_KEY))
}
