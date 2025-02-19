// Updated LoginPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API } from '../api/api';
import { validateLogin } from '../utils/validation';
import { useToast } from '../context/ToastContext';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Card,
    Alert,
} from '@mui/material';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateLogin(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            const response = await API.post('/login/', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('is_admin', response.data.is_admin.toString());
            showToast('Login successful!', 'success');
            
            // Redirect based on user type
            if (response.data.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.response?.data?.detail || 'Invalid username or password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Card sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Login
                    </Typography>
                    
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            margin="normal"
                        />
                        
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            margin="normal"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <Typography align="center" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Link to="/signup">Sign up</Link>
                    </Typography>
                </Card>
            </Box>
        </Container>
    );
}

export default LoginPage;
