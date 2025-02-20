import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('isAdmin'));

    const login = (token, isAdmin) => {
        localStorage.setItem('token', token);
        localStorage.setItem('isAdmin', isAdmin);
        setIsAuthenticated(true);
        setIsAdmin(isAdmin);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext); 