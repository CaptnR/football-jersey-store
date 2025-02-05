import React, { useState } from 'react';
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
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/jerseys/${jerseyId}/reviews/`,
                {
                    rating: parseInt(rating),
                    comment: comment
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            onReviewAdded(response.data);
            setComment('');
            setRating(0);
            setSuccess('Review submitted successfully!');
            setError('');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.message || 
                               'Failed to submit review';
            setError(errorMessage);
            setSuccess('');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Write a Review
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box sx={{ mb: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                    value={rating}
                    onChange={(event, newValue) => {
                        setRating(newValue);
                    }}
                />
            </Box>
            
            <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Your Review"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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