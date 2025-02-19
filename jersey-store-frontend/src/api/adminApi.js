import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

export const adminApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token
adminApi.interceptors.request.use(
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

export const fetchAdminDashboard = async () => {
    try {
        const response = await adminApi.get('/admin/dashboard/');
        console.log('Admin dashboard response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        throw error;
    }
};

export const updateJerseyStock = async (jerseyId, stockData) => {
    try {
        const response = await adminApi.patch(`/jerseys/${jerseyId}/stock/`, stockData);
        return response.data;
    } catch (error) {
        console.error('Error updating jersey stock:', error);
        throw error;
    }
}; 