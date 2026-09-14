import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUserState] = useState(() => {
        const storedUser = localStorage.getItem('user')

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
            localStorage.setItem('user', JSON.stringify(userData))
        } else {
            localStorage.removeItem('user')
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}