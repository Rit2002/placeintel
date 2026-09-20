import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4 text-yellow-400"
    >
      <circle cx="12" cy="12" r="4" />

      <path
        strokeLinecap="round"
        d="
          M12 2v2
          M12 20v2
          M4.93 4.93l1.41 1.41
          M17.66 17.66l1.41 1.41
          M2 12h2
          M20 12h2
          M4.93 19.07l1.41-1.41
          M17.66 6.34l1.41-1.41
        "
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4 text-yellow-300"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3
           7 7 0 0 0 21 12.79Z"
      />
    </svg>
  )
}

function Navbar() {
  const { theme, toggleTheme } = useTheme()

  const isLightTheme = theme === 'placeintel'

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6">
      
      {/* Left side */}
      <div className="flex-1 flex items-center gap-6">
        <Link
          to="/companies"
          className="text-xl font-bold text-primary"
        >
          PlaceIntel
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link
            to="/companies"
            className="btn btn-ghost btn-sm"
          >
            Companies
          </Link>

          <Link
            to="/drives"
            className="btn btn-ghost btn-sm"
          >
            Drives
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-none flex items-center gap-2">

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            isLightTheme
              ? 'Switch to dark theme'
              : 'Switch to light theme'
          }
          title={
            isLightTheme
              ? 'Switch to dark theme'
              : 'Switch to light theme'
          }
          className="
            relative
            w-16
            h-8
            rounded-full
            bg-base-300
            border
            border-base-content/10
            cursor-pointer
            overflow-hidden
            transition-colors
            duration-300
            ease-in-out
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary/40
          "
        >

          {/* Track icons */}
          <span
            className="
              absolute
              inset-0
              flex
              items-center
              justify-between
              px-2
              pointer-events-none
            "
          >
            <span className="flex items-center justify-center w-6 h-6">
              <SunIcon />
            </span>

            <span className="flex items-center justify-center w-6 h-6">
              <MoonIcon />
            </span>
          </span>

          {/* Sliding black knob */}
          <span
            className={`
              absolute
              top-0.5
              left-0.5
              w-7
              h-7
              rounded-full
              bg-black
              shadow-md
              flex
              items-center
              justify-center
              transition-transform
              duration-500
              ease-in-out
              will-change-transform
              ${
                isLightTheme
                  ? 'translate-x-0'
                  : 'translate-x-8'
              }
            `}
          >
            {isLightTheme ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </span>

        </button>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder"
          >
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span>S</span>
            </div>
          </div>

          <ul
            tabIndex={0}
            className="
              menu
              dropdown-content
              bg-base-100
              rounded-box
              z-10
              mt-3
              w-40
              p-2
              shadow
            "
          >
            <li>
              <Link to="/profile">
                My Profile
              </Link>
            </li>

            <li>
              <a onClick={() => alert('logout wiring next')}>
                Logout
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}

export default Navbar