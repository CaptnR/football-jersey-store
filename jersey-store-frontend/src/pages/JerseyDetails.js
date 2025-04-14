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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
import RateReviewIcon from '@mui/icons-material/RateReview';
import DeleteIcon from '@mui/icons-material/Delete';

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

    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [userHasPurchased, setUserHasPurchased] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);

    // New state for editing review
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const [currentUsername, setCurrentUsername] = useState(null);

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Get username from localStorage since we store it during login
            const username = localStorage.getItem('username');
            setCurrentUsername(username);
        }
    }, []);

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

    const handleEditReview = async (review) => {
        try {
            await API.put(`/jerseys/${id}/reviews/${review.id}/`, {
                rating: reviewRating,
                comment: reviewComment
            });
            showToast('Review updated successfully', 'success');
            setOpenReviewDialog(false);
            setEditingReviewId(null);
            fetchJerseyDetails();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to update review', 'error');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await API.delete(`/jerseys/${id}/reviews/${reviewId}/`);
            showToast('Review deleted successfully', 'success');
            setDeleteConfirmOpen(false);
            setOpenReviewDialog(false);
            setEditingReviewId(null);
            fetchJerseyDetails();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to delete review', 'error');
        }
    };

    const handleSubmitReview = async () => {
        try {
            if (editingReviewId) {
                await API.put(`/jerseys/${id}/reviews/${editingReviewId}/`, {
                    rating: reviewRating,
                    comment: reviewComment
                });
            } else {
                await API.post(`/jerseys/${id}/reviews/`, {
                    rating: reviewRating,
                    comment: reviewComment
                });
            }
            showToast(`Review ${editingReviewId ? 'updated' : 'submitted'} successfully`, 'success');
            setOpenReviewDialog(false);
            setEditingReviewId(null);
            setReviewRating(0);
            setReviewComment('');
            fetchJerseyDetails();
        } catch (error) {
            showToast(error.response?.data?.error || `Failed to ${editingReviewId ? 'update' : 'submit'} review`, 'error');
        }
    };

    const handleAddToCart = () => {
        console.log('Adding to cart:', jersey);
        if (!jersey) return;

        const itemToAdd = {
            ...jersey,
            size: selectedSize,
            quantity: 1
        };
        
        addToCart(itemToAdd);
        showToast('Added to cart successfully', 'success');
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

    const fetchJerseyDetails = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/jerseys/${id}/`);
            setJersey(response.data);
            setUserHasPurchased(response.data.user_has_purchased);
            
            // Fetch reviews and log the response
            const reviewsResponse = await API.get(`/jerseys/${id}/reviews/`);
            const reviews = reviewsResponse.data;
            console.log('Reviews:', reviews);
            console.log('Current username:', currentUsername);
            
            setJersey(prev => ({
                ...prev,
                reviews: reviews
            }));
            
            setUserHasReviewed(reviews.some(review => review.user_name === currentUsername));
            
        } catch (error) {
            console.error('Error fetching jersey details:', error);
            showToast('Failed to load jersey details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJerseyDetails();
    }, [id]);

    // Add a safe price calculation helper
    const getDisplayPrice = (jersey) => {
        if (!jersey) return '0.00';
        const price = jersey.sale_price || jersey.price;
        return price ? price.toFixed(2) : '0.00';
    };

    // Add this helper function
    const getAverageRating = (jersey) => {
        if (!jersey || typeof jersey.average_rating !== 'number') {
            return 0;
        }
        return jersey.average_rating;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
                                                    value={getAverageRating(jersey)} 
                                                    readOnly 
                                                    precision={0.5}
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                    ({getAverageRating(jersey).toFixed(1)})
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                {jersey.player.team.name}
                                            </Typography>
                                            <Typography variant="h5" color="primary" gutterBottom>
                                                ₹{getDisplayPrice(jersey)}
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

                                            <Alert severity="info" sx={{ mb: 3 }}>
                                                Only verified purchasers can leave reviews
                                            </Alert>

                                            {/* Reviews List */}
                                            {jersey?.reviews?.length > 0 ? (
                                                <Box sx={{ mb: 3 }}>
                                                    {jersey.reviews.map((review) => {
                                                        console.log('Rendering review:', review);
                                                        console.log('Review username:', review.user_name);
                                                        console.log('Current username:', currentUsername);
                                                        console.log('Do they match?', review.user_name === currentUsername);
                                                        
                                                        return (
                                                            <Card 
                                                                key={review.id}
                                                                sx={{ 
                                                                    mb: 2,
                                                                    p: 2,
                                                                    backgroundColor: 'background.paper',
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    borderRadius: 2
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <Box>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                            <Rating value={review.rating} readOnly precision={1} />
                                                                            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                                                                                by {review.user_name}
                                                                            </Typography>
                                                                            {review.is_edited && (
                                                                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                                                    (edited)
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                        <Typography variant="body1">{review.comment}</Typography>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                            {new Date(review.created_at).toLocaleDateString()}
                                                                        </Typography>
                                                                    </Box>
                                                                    {currentUsername && review.user_name === currentUsername && (
                                                                        <Box>
                                                                            <IconButton 
                                                                                size="small" 
                                                                                onClick={() => handleEditReview(review)}
                                                                                sx={{ mr: 1 }}
                                                                            >
                                                                                <EditIcon fontSize="small" />
                                                                            </IconButton>
                                                                            <IconButton 
                                                                                size="small" 
                                                                                onClick={() => {
                                                                                    setEditingReviewId(review.id);
                                                                                    setDeleteConfirmOpen(true);
                                                                                }}
                                                                                color="error"
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    )}
                                                                </Box>
                                                            </Card>
                                                        );
                                                    })}
                                                </Box>
                                            ) : (
                                                <Typography color="text.secondary" sx={{ mb: 3 }}>
                                                    No reviews yet
                                                </Typography>
                                            )}

                                            {/* Review Button */}
                                            {userHasPurchased && !userHasReviewed && (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => setOpenReviewDialog(true)}
                                                    startIcon={<RateReviewIcon />}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Write a Review
                                                </Button>
                                            )}

                                            {/* Review Dialog */}
                                            <Dialog 
                                                open={openReviewDialog} 
                                                onClose={() => {
                                                    setOpenReviewDialog(false);
                                                    setEditingReviewId(null);
                                                    setReviewRating(0);
                                                    setReviewComment('');
                                                }}
                                                maxWidth="sm"
                                                fullWidth
                                            >
                                                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {editingReviewId ? 'Edit Review' : 'Write a Review'}
                                                    {editingReviewId && (
                                                        <IconButton 
                                                            color="error"
                                                            onClick={() => setDeleteConfirmOpen(true)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </DialogTitle>
                                                <DialogContent>
                                                    <Box sx={{ py: 2 }}>
                                                        <Typography gutterBottom>Rating</Typography>
                                                        <Rating
                                                            value={reviewRating}
                                                            onChange={(event, newValue) => {
                                                                setReviewRating(newValue);
                                                            }}
                                                            precision={1}
                                                            size="large"
                                                        />
                                                        <TextField
                                                            autoFocus
                                                            margin="dense"
                                                            label="Your Review"
                                                            fullWidth
                                                            multiline
                                                            rows={4}
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                            sx={{ mt: 2 }}
                                                        />
                                                    </Box>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={() => {
                                                        setOpenReviewDialog(false);
                                                        setEditingReviewId(null);
                                                        setReviewRating(0);
                                                        setReviewComment('');
                                                    }}>
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        onClick={handleSubmitReview}
                                                        variant="contained"
                                                        disabled={!reviewRating}
                                                    >
                                                        {editingReviewId ? 'Update' : 'Submit'}
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>

                                            {/* Delete Confirmation Dialog */}
                                            <Dialog
                                                open={deleteConfirmOpen}
                                                onClose={() => setDeleteConfirmOpen(false)}
                                            >
                                                <DialogTitle>Delete Review</DialogTitle>
                                                <DialogContent>
                                                    <Typography>
                                                        Are you sure you want to delete this review? This action cannot be undone.
                                                    </Typography>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDeleteReview(editingReviewId)}
                                                        color="error"
                                                        variant="contained"
                                                    >
                                                        Delete
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
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
