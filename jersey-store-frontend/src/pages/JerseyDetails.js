// Updated JerseyDetails.js with fixes for Axios 401 error and review functionality

import React, { useEffect, useState, useContext } from 'react';
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
    CardMedia,
    Stack,
    IconButton,
    Fade,
    TextField,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { API } from '../api/api';

function JerseyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jersey, setJersey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const isAuthenticated = !!localStorage.getItem('token');

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const token = localStorage.getItem('token');

    // Fetch reviews
    const fetchReviews = async () => {
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
    };

    // Fetch jersey and player details
    useEffect(() => {
        const fetchJerseyDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/jerseys/${id}/`, {
                    headers: token ? { Authorization: `Token ${token}` } : {}
                });
                setJersey(response.data);
            } catch (error) {
                if (error.response?.status === 404) {
                    setError('Jersey not found');
                } else {
                    setError('Failed to load jersey details');
                }
                console.error('Error fetching jersey details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJerseyDetails();
        fetchReviews();
    }, [id, token]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            await axios.post(
                `http://127.0.0.1:8000/api/jerseys/${id}/reviews/`,
                {
                    rating: userRating,
                    comment: comment,
                    jersey: id
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Reset form and refresh reviews
            setUserRating(0);
            setComment('');
            fetchReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        addToCart(jersey);
        setTimeout(() => {
            setIsAddingToCart(false);
            navigate('/cart');
        }, 500);
    };

    const handleWishlist = async () => {
        try {
            if (isWishlisted) {
                await removeFromWishlist(jersey.id);
            } else {
                await addToWishlist(jersey.id);
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error);
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
        <Fade in={true} timeout={500}>
            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        {/* Jersey Image */}
                        <Grid item xs={12} md={6}>
                            <Card 
                                elevation={0}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={jersey.image}
                                    alt={jersey.player.name}
                                    sx={{
                                        height: 'auto',
                                        objectFit: 'contain',
                                        p: 4,
                                    }}
                                />
                            </Card>
                        </Grid>

                        {/* Jersey Details */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {jersey.player.name} Jersey
                                </Typography>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {jersey.player.team.name}
                                </Typography>
                                <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
                                    ${jersey.price}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            startIcon={<ShoppingCartIcon />}
                                            onClick={handleAddToCart}
                                            sx={{ px: 4 }}
                                        >
                                            Add to Cart
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="outlined"
                                            startIcon={<FavoriteIcon />}
                                            sx={{ px: 4 }}
                                            onClick={handleWishlist}
                                        >
                                            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Reviews Section */}
                            <Box sx={{ mt: 6 }}>
                                <Typography variant="h6" gutterBottom>
                                    Customer Reviews
                                </Typography>

                                {/* Review Form */}
                                <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
                                    <Rating
                                        value={userRating}
                                        onChange={(event, newValue) => setUserRating(newValue)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Write your review here..."
                                        sx={{ mb: 2 }}
                                    />
                                    <Button type="submit" variant="contained">
                                        Submit Review
                                    </Button>
                                </Box>

                                {/* Reviews List */}
                                <Box>
                                    {reviews.map((review) => (
                                        <Card key={review.id} sx={{ mb: 2, p: 2 }}>
                                            <Rating value={review.rating} readOnly />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {review.comment}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                By {review.user_name} on {new Date(review.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Card>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Fade>
    );
}

export default JerseyDetails;
