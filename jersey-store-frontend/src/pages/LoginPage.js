// Updated LoginPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { API } from '../api/api';
import { validateLogin } from '../utils/validation';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
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
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login(formData);
            
            // Navigation should happen after token is set
            if (response.is_admin) {
                navigate('/admin/dashboard');
            } else {
                navigate(location.state?.from || '/');
            }
            
            showToast('Login successful!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.error || 'Failed to login');
            showToast(error.response?.data?.error || 'Failed to login', 'error');
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
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3 }}
                        >
                            Login
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
