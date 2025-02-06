// Updated LoginPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
import { Link as RouterLink } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password,
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('is_admin', response.data.is_admin.toString());
            
            // Redirect back to the original page
            navigate(from, { replace: true });
        } catch (error) {
            setError('Invalid credentials');
            console.error('Login error:', error);
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
                            Sign In
                        </Typography>
                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
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
                                autoComplete="current-password"
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
                                Sign In
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link 
                                        component={RouterLink} 
                                        to="/signup"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        Don't have an account? Sign Up
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

export default LoginPage;
