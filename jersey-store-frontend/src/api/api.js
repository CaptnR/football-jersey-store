import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Your backend's base URL
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
    const url = `http://127.0.0.1:8000/api/jerseys/${query}`;
    return axios.get(url);
};

export const fetchCustomizations = () => API.get('/customizations/');
export const saveCustomization = (data) => API.post('/customizations/', data);

export const getWishlist = async (token) => {
    return axios.get('http://127.0.0.1:8000/api/wishlist/', {
        headers: { Authorization: `Token ${token}` },
    });
};

export const addToWishlist = async (token, jerseyId) => {
    return axios.post(
        'http://127.0.0.1:8000/api/wishlist/',
        { jersey_id: jerseyId },
        { headers: { Authorization: `Token ${token}` } }
    );
};

export const removeFromWishlist = async (token, jerseyId) => {
    return axios.delete('http://127.0.0.1:8000/api/wishlist/', {
        headers: { Authorization: `Token ${token}` },
        data: { jersey_id: jerseyId },
    });
};

