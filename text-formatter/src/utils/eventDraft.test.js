import assert from 'node:assert/strict'
import test from 'node:test'
import { createDraftRecord, readDraftRecord, DRAFT_LIFETIME } from './eventDraft.js'

function exampleDraft() {
  return {
    form: { eventName: 'Event', statusUpdate: 'Setup done', collectionDate: '', collectionTime: '', notes: 'Note' },
    routers: [{
      id: 4, model: 'E3000', routerId: '5', mode: 'Spillover', provider: 'StarHub / Singtel',
      includeSwitch: true, switchPorts: '24', switchSerialNumber: 'SW01', location: 'Stage',
      accessPoints: [{ id: 8, serialNumber: 'AB12' }],
      speedTests: [{
        id: 9, label: 'LAN', error: 'Temporary error',
        image: {
          file: new Blob(['image'], { type: 'image/png' }), name: 'lan.png', previewUrl: 'blob:old-session',
          crop: { x: 0.1, y: 0, width: 0.9, height: 1 },
        },
      }],
    }],
    networks: [{ id: 3, ssid: 'Guest', password: 'password' }],
    expandedRouterId: 4,
  }
}

test('drafts retain equipment, credentials, image bytes and crop without stale URLs or errors', async () => {
  const draft = exampleDraft()
  const stored = createDraftRecord(draft, 1000)
  const restored = readDraftRecord(structuredClone(stored), 2000)
  assert.deepEqual(restored.form, draft.form)
  assert.deepEqual(restored.networks, draft.networks)
  assert.deepEqual(restored.routers[0].accessPoints, draft.routers[0].accessPoints)
  const speedTest = restored.routers[0].speedTests[0]
  assert.equal(await speedTest.image.file.text(), 'image')
  assert.deepEqual(speedTest.image.crop, draft.routers[0].speedTests[0].image.crop)
  assert.equal(speedTest.image.name, 'lan.png')
  assert.equal('previewUrl' in speedTest.image, false)
  assert.equal('error' in speedTest, false)
})

test('drafts expire at 24 hours and missing drafts return null', () => {
  const stored = createDraftRecord(exampleDraft(), 1000)
  assert.ok(readDraftRecord(stored, 1000 + DRAFT_LIFETIME - 1))
  assert.equal(readDraftRecord(stored, 1000 + DRAFT_LIFETIME), null)
  assert.equal(readDraftRecord(undefined), null)
})

test('incomplete form values are preserved for editing', () => {
  const draft = exampleDraft()
  draft.routers[0].routerId = ''
  draft.routers[0].accessPoints[0].serialNumber = 'A'
  draft.routers[0].speedTests[0].image = null
  draft.networks[0].password = ''
  assert.ok(readDraftRecord(createDraftRecord(draft)))
})

test('malformed and incompatible drafts are rejected before rendering', () => {
  const record = createDraftRecord(exampleDraft())
  assert.throws(() => readDraftRecord({ ...record, version: 2 }))
  assert.throws(() => readDraftRecord({ ...record, routers: [] }))
  assert.throws(() => readDraftRecord({ ...record, networks: [null] }))
  assert.throws(() => readDraftRecord({ ...record, routers: [...record.routers, ...record.routers] }))
  const invalidImage = structuredClone(record)
  invalidImage.routers[0].speedTests[0].image.file = 'blob:expired'
  assert.throws(() => readDraftRecord(invalidImage))
})

test('collapsed state survives and missing expanded IDs fall back to the first router', () => {
  const record = createDraftRecord(exampleDraft())
  assert.equal(readDraftRecord({ ...record, expandedRouterId: null }).expandedRouterId, null)
  assert.equal(readDraftRecord({ ...record, expandedRouterId: 999 }).expandedRouterId, 4)
})
