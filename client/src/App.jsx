import {
    Routes,
    Route,
    Navigate,
    useLocation
} from 'react-router-dom'


import Login from './pages/Login'
import Register from './pages/Register'

import CompanyCatalog from './pages/CompanyCatalog'
import CompanyDetail from './pages/CompanyDetails'
import ProfileCompletion from './pages/ProfileCompletion'

import StudentDrives from './pages/StudentDrives'
import MockInterview from './pages/MockInterview'


import TpoDashboard from './pages/TpoDashboard'
import TpoCompanies from './pages/TpoCompanies'
import TpoDriveManagement from './pages/TpoDriveManagement'
import TpoVerification from './pages/TpoVerification'
import TpoStudents from './pages/TpoStudents'


import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminTpoManagement from './pages/AdminTpoManagement'


import ProtectedRoute from './components/ProtectedRoute'


function NotFoundRedirect() {

    const location = useLocation()

    const isAdminArea =
        location.pathname.startsWith('/admin')


    if (isAdminArea) {

        return (
            <Navigate
                to="/admin/login"
                replace
            />
        )
    }


    return (
        <Navigate
            to="/login"
            replace
        />
    )
}


function App() {

    return (

        <Routes>


            {/* =================================================
                DEFAULT
            ================================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* =================================================
                NORMAL AUTHENTICATION
            ================================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =================================================
                STUDENT ROUTES
            ================================================= */}

            <Route
                path="/companies"
                element={
                    <ProtectedRoute
                        allowedRoles={['STUDENT']}
                    >
                        <CompanyCatalog />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/companies/:id"
                element={
                    <ProtectedRoute
                        allowedRoles={['STUDENT']}
                    >
                        <CompanyDetail />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/drives"
                element={
                    <ProtectedRoute
                        allowedRoles={['STUDENT']}
                    >
                        <StudentDrives />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/profile"
                element={
                    <ProtectedRoute
                        allowedRoles={['STUDENT']}
                    >
                        <ProfileCompletion />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/mock-interview/:companyId"
                element={
                    <ProtectedRoute
                        allowedRoles={['STUDENT']}
                    >
                        <MockInterview />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                TPO ROUTES
            ================================================= */}

            <Route
                path="/tpo"
                element={
                    <ProtectedRoute
                        allowedRoles={['TPO']}
                    >
                        <TpoDashboard />
                    </ProtectedRoute>
                }
            >

                <Route
                    index
                    element={
                        <Navigate
                            to="companies"
                            replace
                        />
                    }
                />

                <Route
                    path="companies"
                    element={<TpoCompanies />}
                />

                <Route
                    path="drives"
                    element={<TpoDriveManagement />}
                />

                <Route
                    path="verification"
                    element={<TpoVerification />}
                />

                <Route
                    path="students"
                    element={<TpoStudents />}
                />

            </Route>


            {/* =================================================
                ADMIN LOGIN
            ================================================= */}

            <Route
                path="/admin/login"
                element={<AdminLogin />}
            />


            {/* =================================================
                ADMIN APPLICATION
            ================================================= */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute
                        allowedRoles={['ADMIN']}
                    >
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            >

                <Route
                    index
                    element={

                        <div>

                            <h1 className="text-2xl font-bold">
                                Admin Dashboard
                            </h1>

                            <p className="text-sm text-base-content/60 mt-1">
                                Manage TPO accounts and administration.
                            </p>

                        </div>

                    }
                />

                <Route
                    path="tpos"
                    element={<AdminTpoManagement />}
                />

            </Route>


            {/* =================================================
                UNKNOWN ROUTE
            ================================================= */}

            <Route
                path="*"
                element={<NotFoundRedirect />}
            />

        </Routes>
    )
}


export default App