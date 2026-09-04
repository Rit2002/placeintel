import { createContext, useContext, useState } from 'react'

// creates a React Context that holds authentication-related data
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    return (
        // Every component inside this Provider can access user & setUser
        //<AuthContext.Provider value={{user, setUser}}> :- Puts the data { user, setUser } into the context
        <AuthContext.Provider value={{user, setUser}}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {

    // Gets the value stored in AuthContext.
    return useContext(AuthContext)
}