import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Alert,
    //Card,
} from '@mui/material';
import axios from 'axios';

function ReviewForm({ jerseyId, onReviewAdded }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const resizeObserverError = error => {
            if (error.message.includes('ResizeObserver')) {
                error.stopImmediatePropagation();
            }
        };
        window.addEventListener('error', resizeObserverError);
        return () => window.removeEventListener('error', resizeObserverError);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!rating) {
            setError('Please select a rating');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://127.0.0.1:8000/api/jerseys/${jerseyId}/reviews/`,
                {
                    rating: rating,
                    comment: comment
                },
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );
            setSuccess(true);
            setRating(0);
            setComment('');
            if (onReviewAdded) {
                onReviewAdded(response.data);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.non_field_errors?.[0] ||
                               'Failed to submit review';
            setError(errorMessage);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Write a Review
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Review submitted successfully!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
                sx={{ mb: 2 }}
            />

            <TextField
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                fullWidth
                sx={{ mb: 2 }}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!rating || !comment}
            >
                Submit Review
            </Button>
        </Box>
    );
}

export default ReviewForm; 