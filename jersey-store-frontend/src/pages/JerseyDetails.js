// Updated JerseyDetails.js with fixes for Axios 401 error and review functionality

import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchJerseys, fetchPlayers, addToWishlist, removeFromWishlist } from '../api/api';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Rating,
} from '@mui/material';

function JerseyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jersey, setJersey] = useState(null);
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);
    const [reviews, setReviews] = useState([]);

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const token = localStorage.getItem('token'); // Get token from localStorage

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/jerseys/${id}/reviews/`,
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    }, [id, token]);

    // Fetch jersey and player details
    useEffect(() => {
        if (!token) {
            console.error("No token found. Redirecting to login.");
            navigate('/login');
            return;
        }

        fetchJerseys()
            .then((response) => {
                const selectedJersey = response.data.find((item) => item.id === parseInt(id));
                setJersey(selectedJersey);

                if (selectedJersey) {
                    return fetchPlayers();
                }
                return Promise.reject("Jersey not found");
            })
            .then((response) => {
                const selectedPlayer = response.data.find((item) => item.id === jersey?.player);
                setPlayer(selectedPlayer);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching details:", error);
                if (error.response?.status === 401) {
                    alert("Session expired. Please log in again.");
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/login');
                } else {
                    setError('Failed to fetch jersey details.');
                }
                setLoading(false);
            });
    }, [id, jersey?.player, navigate, token]);

    // Load reviews when component mounts
    useEffect(() => {
        if (token) {
            fetchReviews();
        }
    }, [id, token, fetchReviews]);

    // Handle wishlist functionality
    const handleWishlist = async () => {
        try {
            if (!token) {
                alert("You need to log in to manage your wishlist.");
                navigate('/login');
                return;
            }

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

    if (!jersey || !player) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>
                    Jersey not found.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Card sx={{ display: 'flex', gap: 2, p: 2 }}>
                <CardMedia
                    component="img"
                    sx={{ width: 300, borderRadius: 2, objectFit: 'cover' }}
                    image={jersey.image}
                    alt={`${player.name} Jersey`}
                />

                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {player.name} Jersey
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Price:</strong> ${jersey.price}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        <strong>Team:</strong> {player.team?.name || "Unknown Team"}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => addToCart(jersey)}
                            >
                                Add to Cart
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                component={Link}
                                to="/customize"
                                state={{ jerseyId: jersey.id }}
                            >
                                Customize Jersey
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant={isWishlisted ? "outlined" : "contained"}
                                color={isWishlisted ? "secondary" : "primary"}
                                fullWidth
                                onClick={handleWishlist}
                            >
                                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Reviews Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Customer Reviews
                </Typography>
                <ReviewForm jerseyId={id} onReviewAdded={fetchReviews} />
                
                {reviews.map((review) => (
                    <Card key={review.id} sx={{ mt: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Rating value={review.rating} readOnly />
                            <Typography sx={{ ml: 2 }}>
                                by {review.user_name}
                            </Typography>
                        </Box>
                        <Typography variant="body1">{review.comment}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                    </Card>
                ))}
            </Box>
        </Container>
    );
}

export default JerseyDetails;
