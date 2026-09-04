import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRoles, children }) {

    const { user } = useAuth()

    if(!user) {

        return <Navigate to="/login" replace></Navigate>
    }

    if(!allowedRoles.includes(user.role)) {

        return <Navigate to="/login" replace></Navigate>
    }

    return children
}


export default ProtectedRoute