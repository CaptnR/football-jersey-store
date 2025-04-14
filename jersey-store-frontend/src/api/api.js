import axios from 'axios';

export const API = axios.create({
    baseURL: 'http://localhost:8000/api',  // Make sure this matches your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token and handle data
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`; // Make sure "Token" prefix matches your backend expectation
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Update the response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication functions
export const loginUser = async (data) => {
    try {
        const response = await API.post('/login/', data);
        // Store both token and username
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', data.username);
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
        console.log('Request URL:', `${API.defaults.baseURL}/customizations/`);
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

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await API.patch(`/orders/${orderId}/status/`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const submitReturnRequest = async (orderId, reason) => {
    try {
        const response = await API.post(`/orders/${orderId}/return/`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error submitting return request:', error);
        throw error;
    }
};

export const handleReturnApproval = async (returnId, action) => {
    try {
        const response = await API.patch(`/returns/${returnId}/approve/`, { action });
        return response.data;
    } catch (error) {
        console.error('Error handling return approval:', error);
        throw error;
    }
};

export const fetchPendingReturns = async () => {
    try {
        const response = await API.get('/returns/pending/');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending returns:', error);
        throw error;
    }
};

export const bulkDeleteJerseys = async (jerseyIds) => {
    try {
        const response = await API.post('/jerseys/bulk_delete/', { jersey_ids: jerseyIds });
        return response.data;
    } catch (error) {
        console.error('Error deleting jerseys:', error);
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
};

export const updateReview = async (jerseyId, reviewId, data) => {
    try {
        const response = await API.put(`/jerseys/${jerseyId}/reviews/${reviewId}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating review:', error);
        throw error;
    }
};

export const deleteReview = async (jerseyId, reviewId) => {
    try {
        const response = await API.delete(`/jerseys/${jerseyId}/reviews/${reviewId}/`);
        return response.data;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
};

export default API;

