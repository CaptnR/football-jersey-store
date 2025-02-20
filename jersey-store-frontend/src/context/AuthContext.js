import React, { createContext, useState, useContext, useEffect } from 'react';
import { API } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to fetch user data
    const fetchUserData = async () => {
        try {
            // Call admin check endpoint to get user status
            const response = await API.get('/admin/check/');
            console.log('User data response:', response.data);
            setUser({
                username: response.data.username,
                is_staff: response.data.is_admin
            });
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            // Validate credentials before sending
            if (!credentials.username || !credentials.password) {
                throw new Error('Username and password are required');
            }

            console.log('Sending login request with:', {
                username: credentials.username,
                password: '***' // Don't log actual password
            });
            
            const response = await API.post('/login/', {
                username: credentials.username,
                password: credentials.password
            });
            
            console.log('Login response:', {
                ...response.data,
                token: response.data.token ? '***' : null // Don't log actual token
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser({
                    username: response.data.username,
                    is_staff: response.data.is_admin
                });
                setIsAuthenticated(true);
                return true;
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                isAuthenticated, 
                user, 
                login, 
                logout,
                loading 
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 