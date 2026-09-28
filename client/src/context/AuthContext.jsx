import {
    createContext,
    useContext,
    useState
} from 'react'

import { logout as logoutApi } from '../api/authApi'


const AuthContext = createContext(null)


export function AuthProvider({ children }) {

    const [user, setUserState] = useState(() => {

        const storedUser =
            localStorage.getItem('user')

        if (!storedUser) {
            return null
        }

        try {

            return JSON.parse(storedUser)

        } catch {

            localStorage.removeItem('user')

            return null
        }
    })


    function setUser(userData) {

        setUserState(userData)

        if (userData) {

            localStorage.setItem(
                'user',
                JSON.stringify(userData)
            )

        } else {

            localStorage.removeItem('user')
        }
    }


    /**
     * Perform server-side logout first.
     *
     * If the backend cannot revoke the token,
     * we intentionally do NOT clear local auth state.
     *
     * This preserves the security guarantee:
     *
     * successful frontend logout
     * =
     * successful server-side revocation
     */
    async function logout() {

        await logoutApi()

        /*
         * Backend has successfully revoked the current JWT
         * and expired the HttpOnly cookie.
         */
        setUser(null)
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {

    return useContext(AuthContext)
}