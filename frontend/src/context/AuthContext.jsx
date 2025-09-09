import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';


//creates a box for global context storage of user state
const AuthContext = createContext();

//fills the box with the user state
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    return (
        <AuthContext.Provider value = {{user, setUser}}>
            {children}
        </AuthContext.Provider>
    )

    
}

//custom hook to use auth context
export function useAuth() {
    return useContext(AuthContext);
}