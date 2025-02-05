import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Your backend's base URL
});

// Add token to all requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const loginUser = (data) => API.post('/login/', data);
export const signupUser = (data) => API.post('/signup/', data);
export const setAuthToken = (token) => {
    API.defaults.headers.common['Authorization'] = token ? `Token ${token}` : '';
};

export const isLoggedIn = () => !!localStorage.getItem('token');
export const fetchTeams = () => API.get('/teams/');
export const fetchPlayers = () => API.get('/players/');

export const fetchJerseys = async (query = '') => {
    try {
        const response = await API.get(`jerseys/${query}`);
        return response;
    } catch (error) {
        if (error.response?.status === 401) {
            // Handle unauthorized - maybe redirect to login
            window.location.href = '/login';
        }
        throw error;
    }
};

export const fetchCustomizations = () => API.get('/customizations/');
export const saveCustomization = (data) => API.post('/customizations/', data);

export const getWishlist = async (token) => {
    return axios.get('http://127.0.0.1:8000/api/wishlist/', {
        headers: { Authorization: `Token ${token}` },
    });
};

export const addToWishlist = async (jerseyId) => {
    try {
        const response = await API.post('/wishlist/', { jersey_id: jerseyId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeFromWishlist = async (jerseyId) => {
    try {
        if (!jerseyId || typeof jerseyId !== 'number') {
            throw new Error('Invalid jersey ID');
        }
        
        const response = await API.delete('/wishlist/', { 
            data: { jersey_id: jerseyId }
        });
        return response;
    } catch (error) {
        console.error('Wishlist removal error:', {
            data: error.response?.data,
            status: error.response?.status,
            jerseyId
        });
        throw error;
    }
};

// Export the API instance
export { API };

