// Updated SignupPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { signupUser } from '../api/api';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Card,
    Grid,
    Link,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function SignupPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signupUser({
                username: username,
                password: password
            });
            
            showToast('Registration successful! Please login to continue.', 'success');
            navigate('/login'); // Redirect to login page
            
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to register');
            showToast(error.response?.data?.error || 'Failed to register', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Card
                    elevation={0}
                    sx={{
                        p: 4,
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography 
                            component="h1" 
                            variant="h4"
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                mb: 4,
                            }}
                        >
                            Sign Up
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ 
                                    mt: 3, 
                                    mb: 2,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                }}
                            >
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link 
                                        component={RouterLink} 
                                        to="/login"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        Already have an account? Sign In
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Card>
            </Box>
        </Container>
    );
}

export default SignupPage;
