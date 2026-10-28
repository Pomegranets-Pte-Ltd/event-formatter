import portalLogo from '../assets/pomegranets-logo.png'

export default function Navbar({ children, onReset, resetDisabled }) {
  return (
    <header className="site-header">
      <nav className="portal-nav" aria-label="Portal navigation">
        <a className="portal-brand" href="#main-content" aria-label="Pomegranets Event Formatter, main content">
          <img className="portal-logo" src={portalLogo} alt="Pomegranets" width="170" height="40" />
          <span>Event Formatter</span>
        </a>
        <div className="nav-controls">
          {children}
          <button className="nav-reset" type="button" onClick={onReset} disabled={resetDisabled}>
            Reset
          </button>
        </div>
      </nav>
    </header>
  )
}
