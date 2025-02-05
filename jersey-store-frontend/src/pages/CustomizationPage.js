// Updated CustomizationPage.js with Material-UI components and styling

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveCustomization } from '../api/api';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from '@mui/material';

function CustomizationPage() {
    const location = useLocation();
    const jerseyId = location.state?.jerseyId;
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [design, setDesign] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess(false);

        if (!jerseyId) {
            setError("Jersey ID is missing. Please try again.");
            return;
        }

        const requestData = { name, number, design, jersey: jerseyId };

        try {
            await saveCustomization(requestData);
            setSuccess(true);
        } catch (err) {
            console.error("Error saving customization:", err);
            setError("Failed to save customization. Please try again.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Customize Your Jersey
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Your customization has been saved!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
                <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                />

                <TextField
                    label="Number"
                    variant="outlined"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                    fullWidth
                />

                <TextField
                    label="Design"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={design}
                    onChange={(e) => setDesign(e.target.value)}
                    required
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    Submit
                </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    &copy; 2023 Jersey Store
                </Typography>
            </Box>
        </Container>
    );
}

export default CustomizationPage;
