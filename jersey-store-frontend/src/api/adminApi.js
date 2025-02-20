import axios from 'axios';

const adminApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export { adminApi };

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