import axios from 'axios';

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
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
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
        // Ensure prices are treated as INR
        return response.data.map(jersey => ({
            ...jersey,
            price: parseFloat(jersey.price)  // Price is already in INR from backend
        }));
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
    // Log incoming data from component
    console.log('Raw data received from component:', {
        ...data,
        jerseyId: data.jerseyId || 'not provided'
    });

    let formattedData; // Declare formattedData outside try block

    try {
        if (!data.name || !data.number) {
            throw new Error('Required fields missing: name and number are required');
        }

        formattedData = {
            jersey_type: data.jerseyId ? 'existing' : 'custom',
            jersey: data.jerseyId || null,
            name: data.name,
            number: data.number,
            primary_color: data.primaryColor || '#000000',
            secondary_color: data.secondaryColor || '#FFFFFF',
            size: data.size || 'M',
            quantity: parseInt(data.quantity) || 1
        };

        // Log formatted data before sending
        console.log('Formatted data being sent to backend:', formattedData);
        console.log('Request URL:', `${BASE_URL}/customizations/`);
        console.log('Request headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
        });

        const response = await API.post('/customizations/', formattedData);
        console.log('Success response from backend:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            originalData: data,
            formattedData // Now formattedData is accessible here
        });
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

// Add these new functions to api.js
export const getLowStockJerseys = async () => {
    try {
        console.log('Making request to /api/jerseys/stock/');
        const response = await API.get('/api/jerseys/stock/');
        console.log('Low stock response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in getLowStockJerseys:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
        }
        throw error;
    }
};

export const updateJerseyStock = async (jerseyId, stockData) => {
    try {
        const response = await API.patch(`/jerseys/${jerseyId}/stock/`, stockData, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error in updateJerseyStock:', error.response || error);
        throw error;
    }
};

export default API;

