import CroppedImagePreview from './CroppedImagePreview'

export default function SpeedTestFields({
  router,
  routerNumber,
  addSpeedTest,
  updateSpeedTest,
  removeSpeedTest,
  handleRouterImageChange,
  handleRouterImagePaste,
  openRouterImageCrop,
  removeRouterImage,
}) {
  return (
    <div className="speed-test-list">
      {router.speedTests.map((test, index) => {
        const fieldId = `speed-test-${router.id}-${test.id}`
        const testName = `Router ${routerNumber} speed test ${index + 1}`
        return (
          <div
            className="speed-test-field"
            key={test.id}
            data-router-id={router.id}
            data-speed-test-id={test.id}
            role="group"
            tabIndex={0}
            aria-labelledby={`${fieldId}-heading`}
            aria-describedby={`${fieldId}-help${test.error ? ` ${fieldId}-error` : ''}`}
            aria-invalid={Boolean(test.error)}
            onPointerDown={(event) => {
              if (!event.target.closest?.('button, label, input')) event.currentTarget.focus()
            }}
            onPaste={(event) => handleRouterImagePaste(router.id, test.id, event)}
          >
            <div className="speed-test-heading">
              <span id={`${fieldId}-heading`}>Router {routerNumber} &middot; Speed-test result {index + 1}</span>
              {router.speedTests.length > 1 && (
                <button
                  className="inline-remove"
                  type="button"
                  onClick={() => removeSpeedTest(router.id, test.id)}
                  aria-label={`Remove ${testName} result`}
                >
                  Remove result
                </button>
              )}
            </div>
            <label className="field speed-test-label">
              <span>Result label (optional)</span>
              <input
                value={test.label}
                onChange={(event) => updateSpeedTest(router.id, test.id, { label: event.target.value })}
                placeholder="e.g. LAN, Wi-Fi via AP AB12"
                aria-label={`${testName} label`}
              />
            </label>
            <p className="speed-test-help" id={`${fieldId}-help`}>
              Hover here and paste with Ctrl/Cmd + V. The label is included in the caption.
            </p>
            {test.image ? (
              <div className="selected-image">
                <CroppedImagePreview image={test.image} alt={`Selected image for ${testName}`} />
                <div className="selected-image-details">
                  <strong title={test.image.name}>{test.image.name}</strong>
                  <div className="selected-image-actions">
                    <button
                      className="image-action"
                      type="button"
                      onClick={(event) => openRouterImageCrop(router.id, test.id, event.currentTarget)}
                      aria-label={`Crop or resize ${testName} image`}
                    >
                      Crop
                    </button>
                    <label className="image-action">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleRouterImageChange(router.id, test.id, event)}
                        aria-label={`Replace ${testName} image`}
                        aria-invalid={Boolean(test.error)}
                        aria-describedby={test.error ? `${fieldId}-error` : undefined}
                      />
                    </label>
                    <button
                      className="image-action image-remove"
                      type="button"
                      onClick={() => removeRouterImage(router.id, test.id)}
                      aria-label={`Remove ${testName} image`}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleRouterImageChange(router.id, test.id, event)}
                  aria-label={`Choose ${testName} image`}
                  aria-invalid={Boolean(test.error)}
                  aria-describedby={test.error ? `${fieldId}-error` : `${fieldId}-help`}
                />
                <span>Choose image</span>
                <small>PNG, JPG or WebP</small>
              </label>
            )}
            {test.error && <small className="image-error" id={`${fieldId}-error`} role="alert">{test.error}</small>}
          </div>
        )
      })}
      <button
        className="text-button add-button"
        type="button"
        onClick={() => addSpeedTest(router.id)}
        aria-label={`Add another speed-test result to router ${routerNumber}`}
      >
        Add another speed-test result
      </button>
    </div>
  )
}
