import { useEffect, useRef } from 'react'
import SpeedTestFields from './SpeedTestFields'
import RouterEquipment from './RouterEquipment'
import { getClipboardImageFile } from '../utils/imageClipboard'

function getRouterSummary(router) {
  const parts = []
  if (router.includeSwitch) parts.push(`${router.switchPorts}-port switch`)
  if (router.accessPoints.length) {
    parts.push(`${router.accessPoints.length} AP${router.accessPoints.length === 1 ? '' : 's'}`)
  }
  const images = router.speedTests.filter((test) => test.image).length
  parts.push(`${router.speedTests.length} speed test${router.speedTests.length === 1 ? '' : 's'}`)
  parts.push(images ? `${images} image${images === 1 ? '' : 's'} attached` : 'No images attached')
  if (router.location.trim()) parts.push(router.location.trim())

  return parts.join(' \u00b7 ')
}

export default function RouterSection({
  routers,
  expandedRouterId,
  toggleRouter,
  routerErrors,
  isCollectionDone,
  updateRouter,
  removeRouter,
  addRouter,
  addAccessPoint,
  updateAccessPoint,
  removeAccessPoint,
  addSpeedTest,
  updateSpeedTest,
  removeSpeedTest,
  handleRouterImageChange,
  handleRouterImagePaste,
  openRouterImageCrop,
  removeRouterImage,
}) {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (isCollectionDone) return

    function pasteIntoHoveredImage(event) {
      if (event.defaultPrevented || !getClipboardImageFile(event.clipboardData)) return

      const hoveredField = sectionRef.current?.querySelector('.speed-test-field:hover')
      const router = routers.find(
        (item) => String(item.id) === hoveredField?.dataset.routerId,
      )
      const speedTest = router?.speedTests.find(
        (test) => String(test.id) === hoveredField?.dataset.speedTestId,
      )
      if (!speedTest) return

      // Paste normally follows keyboard focus. A hovered image field takes
      // priority for screenshots, even when another router still has focus.
      event.stopPropagation()
      handleRouterImagePaste(router.id, speedTest.id, event)
    }

    document.addEventListener('paste', pasteIntoHoveredImage, true)
    return () => document.removeEventListener('paste', pasteIntoHoveredImage, true)
  }, [handleRouterImagePaste, isCollectionDone, routers])

  return (
    <section
      ref={sectionRef}
      className="form-section"
      hidden={isCollectionDone}
    >
      <div className="section-heading">
        <span className="section-step" aria-hidden="true">2</span>
        <h2>Routers</h2>
      </div>

      <div className="router-list">
        {routers.map((router, index) => (
          <div className={`router-block ${expandedRouterId === router.id ? 'is-expanded' : ''}`} key={router.id} data-router-block-id={router.id}>
            <div className="router-block-header">
              <button
                className="router-toggle"
                type="button"
                aria-expanded={expandedRouterId === router.id}
                aria-controls={`router-content-${router.id}`}
                onClick={() => toggleRouter(router.id)}
              >
                <span className="router-summary">
                  <strong>Router {index + 1} &middot; {router.model} - {router.routerId.trim() || 'ID needed'}</strong>
                  <small>{getRouterSummary(router)}</small>
                  {(routerErrors[router.id]?.routerId || routerErrors[router.id]?.switchSerialNumber ||
                    Object.values(routerErrors[router.id]?.accessPoints ?? {}).some(Boolean)) && (
                    <small className="router-summary-error">Check required fields</small>
                  )}
                </span>
                <span className="router-toggle-action" aria-hidden="true">
                  {expandedRouterId === router.id ? 'Collapse −' : 'Edit +'}
                </span>
              </button>
              {routers.length > 1 && (
                <button
                  className="inline-remove"
                  type="button"
                  onClick={() => removeRouter(router.id)}
                  aria-label={`Remove router ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="router-content" id={`router-content-${router.id}`} hidden={expandedRouterId !== router.id}>
              <div className="field-grid two-columns router-primary-fields">
                <label className="field">
                  <span>Model</span>
                  <select
                    value={router.model}
                    onChange={(event) => updateRouter(router.id, 'model', event.target.value)}
                    aria-label={`Router ${index + 1} model`}
                  >
                    <option>E3000</option>
                    <option>AER2200</option>
                    <option>Peplink</option>
                    <option>SOHO</option>
                  </select>
                </label>

                <label className="field">
                  <span>Router ID *</span>
                  <div className="router-id-input">
                    <b>{router.model} -</b>
                    <input
                      value={router.routerId}
                      onChange={(event) => updateRouter(router.id, 'routerId', event.target.value)}
                      placeholder="e.g. 5"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label={`Router ${index + 1} ID`}
                      aria-invalid={Boolean(routerErrors[router.id]?.routerId)}
                      aria-describedby={routerErrors[router.id]?.routerId ? `router-error-${router.id}` : undefined}
                    />
                  </div>
                  {routerErrors[router.id]?.routerId && (
                    <small id={`router-error-${router.id}`}>
                      {routerErrors[router.id].routerId}
                    </small>
                  )}
                </label>

              </div>

              <div className="router-settings">
                <div className="router-settings-content">
                  <div className="field-grid two-columns">
                    <label className="field">
                      <span>Mode</span>
                      <select
                        value={router.mode}
                        onChange={(event) =>
                          updateRouter(router.id, 'mode', event.target.value)
                        }
                        aria-label={`Router ${index + 1} mode`}
                        aria-describedby={
                          router.model === 'SOHO'
                            ? `mode-note-${router.id}`
                            : undefined
                        }
                        disabled={router.model === 'SOHO'}
                      >
                        <option>Spillover</option>
                        <option>Round Robin</option>
                        <option>NA</option>
                      </select>
                      {router.model === 'SOHO' && (
                        <small
                          className="field-note"
                          id={`mode-note-${router.id}`}
                        >
                          Mode is not included in SOHO messages.
                        </small>
                      )}
                    </label>

                    <label className="field">
                      <span>Provider</span>
                      <select
                        value={router.provider}
                        onChange={(event) =>
                          updateRouter(
                            router.id,
                            'provider',
                            event.target.value,
                          )
                        }
                        aria-label={`Router ${index + 1} network provider`}
                      >
                        <option>StarHub / Singtel</option>
                        <option>Singtel / StarHub</option>
                        <option>Singtel only</option>
                        <option>StarHub only</option>
                        <option>StarHub (WAN)</option>
                        <option>Singtel (WAN)</option>
                      </select>
                    </label>

                    <label className="field router-location-field">
                      <span>Location</span>
                      <input
                        value={router.location}
                        onChange={(event) =>
                          updateRouter(
                            router.id,
                            'location',
                            event.target.value,
                          )
                        }
                        placeholder="e.g. FOH, beside the stage"
                        aria-label={`Router ${index + 1} location`}
                      />
                    </label>
                  </div>

                  <RouterEquipment
                    router={router}
                    routerNumber={index + 1}
                    errors={routerErrors[router.id]?.accessPoints}
                    switchError={routerErrors[router.id]?.switchSerialNumber}
                    updateRouter={updateRouter}
                    addAccessPoint={addAccessPoint}
                    updateAccessPoint={updateAccessPoint}
                    removeAccessPoint={removeAccessPoint}
                  />
                </div>
              </div>

              <SpeedTestFields
                router={router}
                routerNumber={index + 1}
                addSpeedTest={addSpeedTest}
                updateSpeedTest={updateSpeedTest}
                removeSpeedTest={removeSpeedTest}
                handleRouterImageChange={handleRouterImageChange}
                handleRouterImagePaste={handleRouterImagePaste}
                openRouterImageCrop={openRouterImageCrop}
                removeRouterImage={removeRouterImage}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="text-button add-button" type="button" onClick={addRouter}>
        Add another router
      </button>
    </section>
  )
}
