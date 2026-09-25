import { NavLink, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { getMyUserInfo } from '../api/tpoApi'


/* ============================================================
   TPO NAVBAR
============================================================ */

function TpoNavbar() {
  const [info, setInfo] = useState(null)


  useEffect(() => {
    let mounted = true


    getMyUserInfo()
      .then((result) => {
        if (!mounted) {
          return
        }


        /*
         * API function returns response.data.
         *
         * Expected:
         *
         * {
         *   success: true,
         *   data: {
         *     fullName: "...",
         *     email: "...",
         *     role: "TPO"
         *   }
         * }
         */


        setInfo(
          result?.data ||
          result
        )
      })
      .catch((error) => {
        console.error(
          'Failed to load user information:',
          error
        )
      })


    return () => {
      mounted = false
    }
  }, [])


  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6">

      <div className="flex-1 text-xl font-bold text-primary">
        PlaceIntel — TPO
      </div>


      {info && (
        <div className="flex-none">

          <div className="dropdown dropdown-end">

            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost gap-2 normal-case"
            >

              <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">

                {info.fullName?.[0]?.toUpperCase() ||
                  info.email?.[0]?.toUpperCase() ||
                  '?'}

              </div>


              <span className="text-sm">
                {info.fullName ||
                  info.email ||
                  'TPO'}
              </span>

            </div>


            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-56 p-3 shadow border border-base-300"
            >

              <li className="px-2 py-1 text-xs text-base-content/50">

                {info.email ||
                  'No email'}

              </li>


              <li className="px-2">

                <span className="badge badge-outline badge-sm">

                  {info.role ||
                    'TPO'}

                </span>

              </li>

            </ul>

          </div>

        </div>
      )}

    </div>
  )
}


/* ============================================================
   TPO SIDEBAR
============================================================ */

function TpoSidebar() {

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-content'
        : 'hover:bg-base-200'
    }`


  return (
    <div className="card bg-base-100 shadow-sm w-40 shrink-0 h-fit sticky top-4">

      <div className="card-body p-2 gap-0.5">

        <NavLink
          to="/tpo/companies"
          className={linkClass}
        >
          Companies
        </NavLink>


        <NavLink
          to="/tpo/drives"
          className={linkClass}
        >
          Drives
        </NavLink>


        <NavLink
          to="/tpo/verification"
          className={linkClass}
        >
          Pending Verifications
        </NavLink>


        <NavLink
          to="/tpo/students"
          className={linkClass}
        >
          Students
        </NavLink>


        <NavLink
          to="/tpo/achievements"
          className={linkClass}
        >
          Achievements
        </NavLink>

      </div>

    </div>
  )
}


/* ============================================================
   TPO DASHBOARD
============================================================ */

function TpoDashboard() {
  return (
    <div className="min-h-screen bg-base-200">

      <TpoNavbar />


      <div className="w-full px-3 lg:px-5 py-6 flex gap-4">

        <TpoSidebar />


        <div className="flex-1 min-w-0">

          <Outlet />

        </div>

      </div>

    </div>
  )
}


export default TpoDashboard