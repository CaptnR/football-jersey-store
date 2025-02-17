import axios from 'axios';
import { useToast } from '../context/ToastContext'; // If you have a toast context

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // Add timeout
});

// Add request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - Is the backend server running?');
            // You can show a toast message here
        } else if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication functions
export const loginUser = async (data) => {
    try {
        const response = await API.post('/login/', data);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const signupUser = async (data) => {
    try {
        const response = await API.post('/signup/', data);
        return response.data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

// Jersey and related data functions
export const fetchJerseys = async (params = {}) => {
    try {
        const response = await API.get('/jerseys/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching jerseys:', error);
        throw error;
    }
};

export const fetchTeams = async () => {
    try {
        const response = await API.get('/teams/');
        return response.data;
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
};

export const fetchPlayers = async () => {
    try {
        const response = await API.get('/players/');
        return response.data;
    } catch (error) {
        console.error('Error fetching players:', error);
        throw error;
    }
};

// Customization functions
export const fetchCustomizations = async () => {
    try {
        const response = await API.get('/customizations/');
        return response.data;
    } catch (error) {
        console.error('Error fetching customizations:', error);
        throw error;
    }
};

export const saveCustomization = async (data) => {
    try {
        const response = await API.post('/customizations/', data);
        return response.data;
    } catch (error) {
        console.error('Error saving customization:', error);
        throw error;
    }
};

// Wishlist functions
export const fetchWishlist = async () => {
    try {
        const response = await API.get('/wishlist/');
        return response.data;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

export const addToWishlist = async (jerseyId) => {
    try {
        const response = await API.post('/wishlist/', { jersey: jerseyId });
        return response.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

export const removeFromWishlist = async (jerseyId) => {
    try {
        const response = await API.delete(`/wishlist/${jerseyId}/`);
        return response.data;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};

// Auth helper functions
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};

export default API;

