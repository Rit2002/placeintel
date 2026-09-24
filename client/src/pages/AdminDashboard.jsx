import {
    NavLink,
    Outlet
} from 'react-router-dom'


function AdminNavbar() {

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


            <div className="flex-none">

                <span className="badge badge-primary badge-outline">
                    ADMIN
                </span>

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