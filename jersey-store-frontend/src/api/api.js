import axios from 'axios';

export const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle unauthorized access
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Keep all the existing API functions
export const loginUser = (data) => API.post('/login/', data);
export const signupUser = (data) => API.post('/signup/', data);
export const fetchJerseys = () => API.get('/jerseys/');
export const fetchTeams = () => API.get('/teams/');
export const fetchPlayers = () => API.get('/players/');
export const fetchCustomizations = () => API.get('/customizations/');
export const saveCustomization = (data) => API.post('/customizations/', data);
export const addToWishlist = (jerseyId) => API.post(`/wishlist/`, { jersey_id: jerseyId });
export const removeFromWishlist = (jerseyId) => API.delete(`/wishlist/${jerseyId}/`);
export const getWishlist = () => API.get('/wishlist/');

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

// Also export as default for components that need it
export default API;

