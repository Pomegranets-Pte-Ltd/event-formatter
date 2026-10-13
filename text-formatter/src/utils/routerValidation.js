export function validateRouter(router) {
  const errors = {}
  if (!router.routerId.trim()) errors.routerId = 'Enter a router ID.'

  const accessPointErrors = {}
  router.accessPoints.forEach((accessPoint) => {
    if (!/^[a-z0-9]{4}$/i.test(accessPoint.cloudId.trim())) {
      accessPointErrors[accessPoint.id] = 'Enter the last 4 letters or numbers.'
    }
  })
  if (Object.keys(accessPointErrors).length) errors.accessPoints = accessPointErrors

  return errors
}
