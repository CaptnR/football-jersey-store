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
export const fetchJerseys = () => API.get('/jerseys/');
export const fetchCustomizations = () => API.get('/customizations/');
export const saveCustomization = (data) => API.post('/customizations/', data);

