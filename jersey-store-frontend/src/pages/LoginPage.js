// Updated LoginPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from '@mui/material';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password,
            });

            const token = response.data.token; // Extract token from the response
            const isAdmin = response.data.is_admin; // Extract admin status from the response

            // Save the token and admin status in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('isAdmin', isAdmin); // Store admin status as 'true' or 'false'

            alert('Login successful!');
            navigate('/'); // Redirect to the home page
        } catch (error) {
            console.error('Error during login:', error.response || error.message);
            setError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Login
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleLogin}
                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
                <TextField
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    fullWidth
                />

                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    Login
                </Button>
            </Box>
        </Container>
    );
}

export default LoginPage;
