import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function Navbar() {

  const { theme, toggleTheme } = useTheme()

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6">
      <div className="flex-1">
        <Link to="/companies" className="text-xl font-bold text-primary">
          PlaceIntel
        </Link>
      </div>
      <div className="flex-none flex items-center gap-2">
        <button className="btn btn-ghost btn-circle" onClick={toggleTheme}>
          {theme === 'placeintel' ? '🌙' : '☀️'}
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span>S</span>
            </div>
          </div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-40 p-2 shadow">
            <li><Link to="/profile">My Profile</Link></li>
            <li><a onClick={() => alert('logout wiring next')}>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar