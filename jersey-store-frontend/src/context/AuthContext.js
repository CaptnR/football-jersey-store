import React, { createContext, useContext, useState } from 'react';
import { API } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const login = async (credentials) => {
        try {
            const response = await API.post('/login/', credentials);
            const { token } = response.data;
            
            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('username', credentials.username);
            
            // Update auth state
            setIsAuthenticated(true);
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 