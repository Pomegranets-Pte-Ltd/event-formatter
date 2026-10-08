import buildInfo from 'virtual:build-info'

export default function VersionHistory() {
  return (
    <details className="version-history">
      <summary>
        {buildInfo.version ? `Version ${buildInfo.version}` : 'Version unavailable'}
        {buildInfo.hasLocalChanges && ' (local changes)'}
        <span> · What’s changed</span>
      </summary>
      <div className="version-history-content">
        <h2>What’s changed</h2>
        {buildInfo.hasLocalChanges && (
          <p>This build includes local changes that have not been committed yet.</p>
        )}
        {buildInfo.history.length ? (
          <>
            <p>Recent changes included in this version, newest first.</p>
            <ol>
              {buildInfo.history.map((commit, index) => (
                <li key={commit.id}>
                  <div className="version-history-meta">
                    <code>{commit.version}</code>
                    <time dateTime={commit.date}>{commit.date}</time>
                    {index === 0 && <strong>Current</strong>}
                  </div>
                  <p>{commit.subject}</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>Change history was not available when this version was built.</p>
        )}
      </div>
    </details>
  )
}
