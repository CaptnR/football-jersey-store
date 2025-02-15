import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Card,
    Alert,
    CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { API } from '../api/api';

function ReviewSection({ jerseyId }) {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviewData();
    }, [jerseyId]);

    const loadReviewData = async () => {
        try {
            setLoading(true);
            const [reviewsResponse, ordersResponse] = await Promise.all([
                API.get(`/jerseys/${jerseyId}/reviews/`),
                API.get('/orders/my_orders/')
            ]);

            const allReviews = reviewsResponse.data;
            const existingUserReview = allReviews.find(review => review.is_users_review);
            
            // Check if user has purchased this jersey
            const hasPurchased = ordersResponse.data.some(order => 
                order.items.some(item => String(item.jersey_id) === String(jerseyId))
            );

            setReviews(allReviews);
            setUserReview(existingUserReview);
            setCanReview(hasPurchased && !existingUserReview);

            if (existingUserReview) {
                setRating(existingUserReview.rating);
                setComment(existingUserReview.comment);
            }
        } catch (error) {
            setError('Failed to load reviews');
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const reviewData = { rating, comment };
            
            if (isEditing) {
                await API.put(`/jerseys/${jerseyId}/reviews/${userReview.id}/`, reviewData);
            } else {
                await API.post(`/jerseys/${jerseyId}/reviews/`, reviewData);
            }

            await loadReviewData();
            setIsEditing(false);
            setSuccess(isEditing ? 'Review updated successfully!' : 'Review submitted successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to submit review');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ mt: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 4 }}>
                {userReview && !isEditing ? (
                    <Card sx={{ mb: 3, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Your Review</Typography>
                            <Button
                                startIcon={<EditIcon />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        </Box>
                        <Rating value={userReview.rating} readOnly />
                        <Typography sx={{ mt: 1 }}>{userReview.comment}</Typography>
                    </Card>
                ) : canReview || (isEditing && userReview) ? (
                    <Card sx={{ mb: 3, p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {isEditing ? 'Edit Your Review' : 'Write a Review'}
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Box sx={{ mb: 2 }}>
                                <Typography component="legend">Rating</Typography>
                                <Rating
                                    value={rating}
                                    onChange={(_, value) => setRating(value)}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your review here..."
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={!rating}
                                >
                                    {isEditing ? 'Update Review' : 'Submit Review'}
                                </Button>
                                {isEditing && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setRating(userReview.rating);
                                            setComment(userReview.comment);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Card>
                ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        {userReview ? 
                            'You have already reviewed this jersey' : 
                            'Only verified purchasers can leave reviews'
                        }
                    </Alert>
                )}
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Customer Reviews
                </Typography>
                {reviews.filter(review => !review.is_users_review).map(review => (
                    <Card key={review.id} sx={{ mb: 2, p: 2 }}>
                        <Rating value={review.rating} readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            {review.comment}
                        </Typography>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default ReviewSection; 