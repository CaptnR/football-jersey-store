// Updated JerseyDetails.js with fixes for Axios 401 error and review functionality

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist } from '../api/api';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection';
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
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { API } from '../api/api';
import EditIcon from '@mui/icons-material/Edit';
import LoadingOverlay from '../components/LoadingOverlay';
import { useToast } from '../context/ToastContext';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function JerseyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { showToast } = useToast();
    const [jersey, setJersey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [comment, setComment] = useState('');
    const isAuthenticated = !!localStorage.getItem('token');

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const token = localStorage.getItem('token');

    // New state for review prompt
    const [showReviewPrompt, setShowReviewPrompt] = useState(true);

    // New state for review eligibility
    const [canReview, setCanReview] = useState(false);

    // New state for existing review
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // New state for size selection
    const [selectedSize, setSelectedSize] = useState('M');
    const [showAlert, setShowAlert] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const SIZES = [
        { value: 'XS', label: 'Extra Small' },
        { value: 'S', label: 'Small' },
        { value: 'M', label: 'Medium' },
        { value: 'L', label: 'Large' },
        { value: 'XL', label: 'Extra Large' },
        { value: 'XXL', label: 'Double Extra Large' },
        { value: 'XXXL', label: 'Triple Extra Large' }
    ];

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) {
                setCanReview(false);
                return;
            }

            try {
                setLoading(true);
                const [jerseyRes, reviewsRes, ordersRes] = await Promise.all([
                    API.get(`/jerseys/${id}/`),
                    API.get(`/jerseys/${id}/reviews/`),
                    API.get('/orders/my_orders/')
                ]);

                setJersey(jerseyRes.data);
                const reviewsData = reviewsRes.data;
                setReviews(reviewsData);

                // Find user's existing review
                const existingReview = reviewsData.find(review => review.is_users_review);
                if (existingReview) {
                    setUserReview(existingReview);
                    setUserRating(existingReview.rating);
                    setComment(existingReview.comment);
                    setCanReview(false);
                } else {
                    // Check if user has purchased the jersey
                    const hasPurchased = ordersRes.data.some(order => 
                        order.items.some(item => String(item.jersey_id) === String(id))
                    );
                    setCanReview(hasPurchased);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (userReview) {
            setUserRating(userReview.rating);
            setComment(userReview.comment);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const reviewData = {
                rating: userRating,
                comment: comment
            };

            if (isEditing && !userReview) {
                setError('No review to edit');
                return;
            }

            const response = isEditing
                ? await API.put(`/jerseys/${id}/reviews/${userReview.id}/`, reviewData)
                : await API.post(`/jerseys/${id}/reviews/`, reviewData);

            // Refresh reviews after submission
            const updatedReviewsRes = await API.get(`/jerseys/${id}/reviews/`);
            const updatedReviews = updatedReviewsRes.data;
            setReviews(updatedReviews);
            
            // Update user's review status
            const newUserReview = updatedReviews.find(review => review.is_users_review);
            setUserReview(newUserReview);
            setIsEditing(false);
            setCanReview(false);
            
            setSuccessMessage(isEditing ? 'Review updated successfully!' : 'Review submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            showToast(isEditing ? 'Review updated successfully' : 'Review submitted successfully', 'success');
        } catch (error) {
            console.error('Error with review:', error.response?.data);
            setError(error.response?.data?.error || 'Failed to submit review');
            showToast(error.response?.data?.error || 'Failed to submit review', 'error');
        }
    };

    const handleAddToCart = () => {
        if (!jersey) return;

        const itemToAdd = {
            ...jersey,
            size: selectedSize
        };
        
        addToCart(itemToAdd);
        setShowAlert(true);
    };

    const handleSizeChange = (event) => {
        setSelectedSize(event.target.value);
    };

    const handleWishlist = async () => {
        try {
            if (isWishlisted) {
                await removeFromWishlist(jersey.id);
                showToast('Removed from wishlist', 'info');
            } else {
                await addToWishlist(jersey.id);
                showToast('Added to wishlist', 'success');
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error);
            showToast('Failed to update wishlist', 'error');
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? jersey.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === jersey.images.length - 1 ? 0 : prev + 1
        );
    };

    const getDisplayImage = () => {
        if (jersey?.images?.length > 0) {
            return jersey.images[currentImageIndex].image;
        }
        if (jersey?.primary_image) {
            return jersey.primary_image;
        }
        return '/placeholder.jpg';
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
        <Container maxWidth="lg">
            <LoadingOverlay loading={loading}>
                <Box sx={{ py: 4 }}>
                    {error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : jersey ? (
                        <Fade in={true} timeout={500}>
                            <Box sx={{ py: 6 }}>
                                {jersey?.user_has_purchased && showReviewPrompt && (
                                    <Alert 
                                        severity="info" 
                                        onClose={() => setShowReviewPrompt(false)}
                                        sx={{ mb: 3 }}
                                    >
                                        You've purchased this jersey! Would you like to leave a review?
                                    </Alert>
                                )}

                                <Grid container spacing={4}>
                                    {/* Image Section */}
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ position: 'relative' }}>
                                            <img
                                                src={getDisplayImage()}
                                                alt={`${jersey?.player?.name}'s Jersey`}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    maxHeight: '500px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            {jersey?.images?.length > 1 && (
                                                <>
                                                    {/* Left Navigation */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '60px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                                                            zIndex: 2,
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={handlePrevImage}
                                                            size="large"
                                                            sx={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                                },
                                                            }}
                                                        >
                                                            <ArrowBackIosNewIcon />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Right Navigation */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '60px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(to left, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                                                            zIndex: 2,
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={handleNextImage}
                                                            size="large"
                                                            sx={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                                },
                                                            }}
                                                        >
                                                            <ArrowForwardIosIcon />
                                                        </IconButton>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>

                                        {/* Thumbnail Navigation */}
                                        {jersey?.images?.length > 1 && (
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    gap: 1, 
                                                    mt: 2, 
                                                    justifyContent: 'center',
                                                    overflowX: 'auto',
                                                    pb: 1
                                                }}
                                            >
                                                {jersey.images.map((img, index) => (
                                                    <Box
                                                        key={img.id}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            cursor: 'pointer',
                                                            border: index === currentImageIndex ? '2px solid' : 'none',
                                                            borderColor: 'primary.main',
                                                            borderRadius: 1,
                                                            overflow: 'hidden',
                                                            flexShrink: 0,
                                                            transition: 'all 0.2s ease-in-out',
                                                            '&:hover': {
                                                                opacity: 0.8,
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={img.image}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Grid>

                                    {/* Jersey Details */}
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ p: 3 }}>
                                            <Typography variant="h4" gutterBottom>
                                                {jersey.player.name}
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Rating 
                                                    value={jersey.average_rating} 
                                                    readOnly 
                                                    precision={0.5}
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                    ({jersey.average_rating.toFixed(1)})
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                {jersey.player.team.name}
                                            </Typography>
                                            <Typography variant="h5" component="div">
                                                ₹{jersey.price}
                                            </Typography>

                                            {jersey.on_sale && (
                                                <Typography variant="h6" color="error">
                                                    Sale Price: ₹{jersey.sale_price}
                                                </Typography>
                                            )}

                                            {/* Size Selection */}
                                            <FormControl fullWidth sx={{ my: 2 }}>
                                                <InputLabel>Size</InputLabel>
                                                <Select
                                                    value={selectedSize}
                                                    onChange={handleSizeChange}
                                                    label="Size"
                                                >
                                                    {SIZES.map((size) => (
                                                        <MenuItem key={size.value} value={size.value}>
                                                            {size.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

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
                                        </Card>

                                        {/* Reviews Section */}
                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Reviews
                                            </Typography>

                                            {isAuthenticated ? (
                                                <ReviewSection jerseyId={id} />
                                            ) : (
                                                <Alert severity="info" sx={{ mt: 4 }}>
                                                    Please log in to view and submit reviews
                                                </Alert>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Fade>
                    ) : null}
                </Box>
            </LoadingOverlay>

            {/* Success Alert */}
            <Snackbar
                open={showAlert}
                autoHideDuration={3000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setShowAlert(false)} 
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Added to cart successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default JerseyDetails;
