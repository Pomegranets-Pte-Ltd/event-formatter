function formatCollectionDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatCollectionTime(value) {
  const [hour, minute] = value.split(':').map(Number)
  const time = new Date(Date.UTC(1970, 0, 1, hour, minute))

  return new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(time)
}

export function buildRouterCaption(router) {
  const equipment = []
  if (router.includeSwitch) equipment.push(`${router.switchPorts}-port switch`)
  if (router.accessPoints.length) {
    equipment.push(router.accessPoints.length === 1 ? 'AP' : `${router.accessPoints.length} APs`)
  }
  const routerLine = [`${router.model} - ${router.routerId.trim()}`, ...equipment].join(' + ')
  const mode = router.model === 'SOHO'
    ? ''
    : router.mode === 'Round Robin' ? 'RR' : router.mode
  const lines = [routerLine, [router.provider, mode].filter(Boolean).join(' ')]

  if (router.includeSwitch && router.switchSerialNumber.trim()) {
    lines.push(`Switch serial number (last 4): ${router.switchSerialNumber.trim()}`)
  }

  router.accessPoints.forEach((accessPoint, index) => {
    const label = router.accessPoints.length === 1 ? 'AP' : `AP ${index + 1}`
    lines.push(`${label} serial number (last 4): ${accessPoint.serialNumber.trim()}`)
  })

  if (router.location.trim()) {
    lines.push(`Location: ${router.location.trim()}`)
  }

  return lines.join('\n')
}

export function buildRouterResults(routers) {
  return routers.flatMap((router, routerIndex) =>
    router.speedTests.map((test, testIndex) => {
      const testLabel = test.label.trim() || (
        router.speedTests.length > 1 ? `Speed test ${testIndex + 1}` : ''
      )
      return {
        id: `${router.id}-${test.id}`,
        label: `Router ${routerIndex + 1}${testLabel ? ` - ${testLabel}` : ''}`,
        caption: `${buildRouterCaption(router)}${testLabel ? `\nSpeed test: ${testLabel}` : ''}`,
        speedTestImage: test.image,
      }
    }),
  )
}

export function buildEventMessage(form, routers, networks) {
  const isCollectionDone = form.statusUpdate === 'Collection done'
  const updateType = isCollectionDone ? 'Collection' : 'Setup'
  const lines = [`${updateType} completed for Event @ ${form.eventName.trim()}`]

  if (!isCollectionDone && (form.collectionDate || form.collectionTime)) {
    const collectionDateTime = [
      form.collectionDate && formatCollectionDate(form.collectionDate),
      form.collectionTime && formatCollectionTime(form.collectionTime),
    ].filter(Boolean)

    lines.push('', `Collection: ${collectionDateTime.join(', ')}`)
  }

  if (!isCollectionDone) {
    routers.forEach((router, index) => {
      const [routerName, ...routerDetails] = buildRouterCaption(router).split('\n')
      const label = routers.length > 1 ? `Router ${index + 1}` : 'Router'

      lines.push('', `${label}: ${routerName}`, ...routerDetails)
    })

    const completedNetworks = networks.filter(
      (network) => network.ssid.trim() && network.password.trim(),
    )

    completedNetworks.forEach((network, index) => {
      const suffix = completedNetworks.length > 1 ? ` ${index + 1}` : ''
      lines.push(
        '',
        `SSID${suffix}: ${network.ssid.trim()}`,
        `Password${suffix}: ${network.password.trim()}`,
      )
    })
  }

  if (form.notes.trim()) lines.push('', `Notes: ${form.notes.trim()}`)

  return lines.join('\n')
}
