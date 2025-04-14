import React, { createContext, useContext, useState, useEffect } from 'react';
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
        const response = await API.post('/login/', credentials);
        const { token, username, is_admin } = response.data;
        
        // Set token in localStorage and API headers
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        if (is_admin) localStorage.setItem('isAdmin', 'true');
        
        // Set the token in API default headers
        API.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // Update auth state
        setUser({
            username,
            is_staff: is_admin
        });
        setIsAuthenticated(true);
        
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        delete API.defaults.headers.common['Authorization'];
        
        // Clear auth state
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