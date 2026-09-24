import {
    Navigate,
    useLocation
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'


function ProtectedRoute({
    allowedRoles,
    children
}) {

    const { user } = useAuth()

    const location = useLocation()


    /*
     * Check whether this is an Admin-only route.
     */
    const isAdminRoute =
        allowedRoles?.includes('ADMIN')


    /*
     * User is not logged in.
     */
    if (!user) {

        return (
            <Navigate
                to={
                    isAdminRoute
                        ? '/admin/login'
                        : '/login'
                }
                replace
                state={{
                    from: location.pathname
                }}
            />
        )
    }


    /*
     * User is logged in but does not
     * have the required role.
     */
    if (!allowedRoles?.includes(user.role)) {

        return (
            <Navigate
                to={
                    isAdminRoute
                        ? '/admin/login'
                        : '/login'
                }
                replace
            />
        )
    }


    /*
     * User is authenticated and authorized.
     */
    return children
}


export default ProtectedRoute