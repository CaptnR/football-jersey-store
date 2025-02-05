// Updated JerseyDetails.js with fixes for Axios 401 error and review functionality

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../api/api';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    Button,
    CircularProgress,
    Alert,
    Rating,
} from '@mui/material';

function JerseyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jersey, setJersey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const [reviews, setReviews] = useState([]);
    const isAuthenticated = !!localStorage.getItem('token');

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const token = localStorage.getItem('token'); // Get token from localStorage

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await axios.get(
                `http://127.0.0.1:8000/api/jerseys/${id}/reviews/`,
                {
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    }, [id]);

    // Fetch jersey and player details
    useEffect(() => {
        const fetchJerseyDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/jerseys/${id}/`, {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });
                setJersey(response.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    // Redirect to login if unauthorized
                    navigate('/login', { 
                        state: { from: `/jersey/${id}` },
                        replace: true 
                    });
                    return;
                }
                setError('Failed to load jersey details');
                console.error('Error fetching jersey details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJerseyDetails();
    }, [id, navigate, token]);

    // Load reviews when component mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchReviews();
        }
    }, [fetchReviews]);

    // Handle wishlist functionality
    const handleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { from: `/jersey/${id}` }
            });
            return;
        }
        try {
            if (isWishlisted) {
                await removeFromWishlist(token, jersey.id);
            } else {
                await addToWishlist(token, jersey.id);
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error.response || error.message);
        }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { from: `/jersey/${id}` }
            });
            return;
        }
        // ... rest of add to cart logic
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!jersey) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>
                    Jersey not found.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <img 
                        src={jersey.image} 
                        alt={`${jersey.player.name} Jersey`}
                        style={{ 
                            width: '100%', 
                            height: 'auto',
                            borderRadius: '8px'
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        {jersey.player.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {jersey.player.team.name} - {jersey.player.team.league}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                        ${jersey.price}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </Button>
                        <Button
                            variant={isWishlisted ? "outlined" : "contained"}
                            color="secondary"
                            onClick={handleWishlist}
                        >
                            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <ReviewForm jerseyId={id} onReviewAdded={(review) => setReviews([...reviews, review])} />
                    </Box>

                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" gutterBottom>
                            Reviews ({reviews.length})
                        </Typography>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <Card key={review.id} sx={{ mb: 2, p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Rating value={review.rating} readOnly size="small" />
                                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                            by {review.user_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {review.comment}
                                    </Typography>
                                </Card>
                            ))
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                No reviews yet. Be the first to review this jersey!
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default JerseyDetails;
