import { useState } from 'react';
import { API } from '../api/api';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callApi = async (method, url, data = null, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await API[method](url, data, options);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, callApi };
}; 