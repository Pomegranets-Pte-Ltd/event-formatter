export default function RouterEquipment({
  router,
  routerNumber,
  errors = {},
  updateRouter,
  addAccessPoint,
  updateAccessPoint,
  removeAccessPoint,
}) {
  return (
    <div className="router-equipment">
      <div className="subsection-heading">
        <div>
          <h3>Connected equipment</h3>
          <p>Add a switch and any access points connected to this router.</p>
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={router.includeSwitch}
          onChange={(event) => updateRouter(router.id, 'includeSwitch', event.target.checked)}
          aria-label={`Router ${routerNumber} include switch`}
        />
        Include switch
      </label>

      {router.includeSwitch && (
        <div className="field-grid two-columns">
          <label className="field">
            <span>Switch ports</span>
            <select
              value={router.switchPorts}
              onChange={(event) => updateRouter(router.id, 'switchPorts', event.target.value)}
              aria-label={`Router ${routerNumber} switch ports`}
            >
              <option value="8">8-port</option>
              <option value="24">24-port</option>
            </select>
          </label>
          <label className="field">
            <span>Switch ID (optional)</span>
            <input
              value={router.switchId}
              onChange={(event) => updateRouter(router.id, 'switchId', event.target.value)}
              placeholder="Equipment ID"
              aria-label={`Router ${routerNumber} switch ID`}
            />
          </label>
        </div>
      )}

      <div className="access-point-list">
        {router.accessPoints.map((accessPoint, index) => {
          const errorId = `ap-error-${router.id}-${accessPoint.id}`
          return (
            <div className="access-point-row" key={accessPoint.id}>
              <label className="field">
                <span>AP {index + 1} Cloud ID *</span>
                <input
                  value={accessPoint.cloudId}
                  onChange={(event) => updateAccessPoint(router.id, accessPoint.id, event.target.value)}
                  placeholder="Last 4 characters"
                  maxLength={4}
                  pattern="[A-Za-z0-9]{4}"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-label={`Router ${routerNumber} AP ${index + 1} Cloud ID`}
                  aria-invalid={Boolean(errors[accessPoint.id])}
                  aria-describedby={errors[accessPoint.id] ? errorId : undefined}
                />
                {errors[accessPoint.id] && <small id={errorId}>{errors[accessPoint.id]}</small>}
              </label>
              <button
                className="remove-button"
                type="button"
                onClick={() => removeAccessPoint(router.id, accessPoint.id)}
                aria-label={`Remove router ${routerNumber} AP ${index + 1}`}
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>
      <button
        className="text-button add-button"
        type="button"
        onClick={() => addAccessPoint(router.id)}
        aria-label={`Add access point to router ${routerNumber}`}
      >
        {router.accessPoints.length ? 'Add another access point' : 'Add access point'}
      </button>
    </div>
  )
}
