import './App.css'
import EventFormatter from './pages/EventFormatter'
import VersionHistory from './components/VersionHistory'

export default function App() {
  return (
    <>
      <EventFormatter />
      <footer className="version-footer">
        <p>
          This platform is intended for internal use by Pomegranets Pte Ltd only.
          {' '}As such, a separate privacy policy is not provided.
          <br />
          For any enquiries or technical support, please contact{' '}
          <a href="mailto:xavier.wong@pomegranets.com">xavier.wong@pomegranets.com</a>.
        </p>
        <VersionHistory />
      </footer>
    </>
  )
}
