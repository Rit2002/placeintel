import {
    NavLink,
    Outlet
} from 'react-router-dom'

import {
    useState
} from 'react'

import {
    useAuth
} from '../context/AuthContext'


function AdminNavbar() {

    const {
        logout
    } = useAuth()

    const [
        loggingOut,
        setLoggingOut
    ] = useState(false)


    async function handleLogout() {

        if (loggingOut) {
            return
        }

        setLoggingOut(true)

        try {

            await logout()

            /*
             * Admin has its own authentication entry point.
             */
            window.location.replace(
                '/admin/login'
            )

        } catch (error) {

            console.error(
                'Admin logout failed:',
                error
            )

            window.alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Logout failed. Please try again.'
            )

            setLoggingOut(false)
        }
    }


    return (

        <header className="navbar bg-base-100 border-b border-base-300 px-6">

            <div className="flex-1">

                <div>

                    <p className="text-lg font-bold text-primary">
                        PlaceIntel
                    </p>

                    <p className="text-xs text-base-content/50">
                        Administration
                    </p>

                </div>

            </div>


            <div className="flex-none flex items-center gap-3">

                <span className="badge badge-primary badge-outline">
                    ADMIN
                </span>


                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >

                    {loggingOut ? (
                        <>
                            <span className="loading loading-spinner loading-xs" />
                            Logging out...
                        </>
                    ) : (
                        'Logout'
                    )}

                </button>

            </div>

        </header>
    )
}


function AdminSidebar() {

    const linkClass = ({ isActive }) =>
        `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-primary text-primary-content'
                : 'hover:bg-base-200'
        }`


    return (

        <aside className="w-56 shrink-0">

            <div className="card bg-base-100 border border-base-300 shadow-sm">

                <div className="card-body p-3">

                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-base-content/40">
                        Administration
                    </p>


                    <NavLink
                        to="/admin"
                        end
                        className={linkClass}
                    >
                        Dashboard
                    </NavLink>


                    <NavLink
                        to="/admin/tpos"
                        className={linkClass}
                    >
                        TPO Management
                    </NavLink>

                </div>

            </div>

        </aside>
    )
}


function AdminDashboard() {

    return (

        <div className="min-h-screen bg-base-200">

            <AdminNavbar />


            <div className="flex gap-6 p-6">

                <AdminSidebar />


                <main className="flex-1 min-w-0">

                    <Outlet />

                </main>

            </div>

        </div>
    )
}


export default AdminDashboard