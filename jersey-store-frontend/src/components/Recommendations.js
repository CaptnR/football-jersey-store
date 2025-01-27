// Updated Recommendations.js with Material-UI components and styling

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
} from '@mui/material';

function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            const token = localStorage.getItem('token'); // Get the user's token
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/jerseys/recommendations/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include the token in the request
                    },
                });
                setRecommendations(response.data);
            } catch (error) {
                console.error('Error fetching recommendations:', error.response || error.message);
            }
        };

        fetchRecommendations();
    }, []);

    if (recommendations.length === 0) {
        return null; // Don't display the section if there are no recommendations
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Recommended for You
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    py: 2,
                }}
            >
                {recommendations.map((jersey) => (
                    <Card
                        key={jersey.id}
                        sx={{ flex: '0 0 auto', width: 200, textAlign: 'center', boxShadow: 3 }}
                    >
                        <CardMedia
                            component="img"
                            height="140"
                            image={jersey.image}
                            alt={jersey.player.name}
                            sx={{ borderRadius: 2, objectFit: 'cover' }}
                        />
                        <CardContent>
                            <Typography
                                variant="body1"
                                component={Link}
                                to={`/jersey/${jersey.id}`}
                                sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
                            >
                                {jersey.player.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ${jersey.price}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default Recommendations;
