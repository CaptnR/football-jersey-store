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
} from '@mui/material';

function SignupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess(false);
        try {
            const response = await signupUser({ username, password });
            console.log('Signup response:', response.data); // Log the response for debugging
            setSuccess(true);
        } catch (err) {
            setError('Signup failed. Username might already exist.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Sign Up
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Signup successful! You can now log in.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSignup}
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
                    Sign Up
                </Button>
            </Box>
        </Container>
    );
}

export default SignupPage;
