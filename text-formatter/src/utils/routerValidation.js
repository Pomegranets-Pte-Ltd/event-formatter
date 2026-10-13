export function validateRouter(router) {
  const errors = {}
  if (!router.routerId.trim()) errors.routerId = 'Enter a router ID.'

  if (
    router.includeSwitch && router.switchSerialNumber.trim() &&
    !/^[a-z0-9]{4}$/i.test(router.switchSerialNumber.trim())
  ) {
    errors.switchSerialNumber = 'Enter the last 4 letters or numbers of the serial number.'
  }

  const accessPointErrors = {}
  router.accessPoints.forEach((accessPoint) => {
    if (!/^[a-z0-9]{4}$/i.test(accessPoint.serialNumber.trim())) {
      accessPointErrors[accessPoint.id] = 'Enter the last 4 letters or numbers of the serial number.'
    }
  })
  if (Object.keys(accessPointErrors).length) errors.accessPoints = accessPointErrors

  return errors
}
