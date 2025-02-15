// Updated WishlistPage.js with Material-UI components and styling

import React, { useState, useEffect, useContext } from 'react';
import { API } from '../api/api';
import {
    Container,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import JerseyCard from '../components/JerseyCard';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { showToast } = useToast();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await API.get('/wishlist/');
            setWishlist(response.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setError('Failed to load wishlist. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (jerseyId) => {
        try {
            await API.delete(`/wishlist/${jerseyId}/`);
            // Update wishlist after removal
            setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== jerseyId));
            showToast('Removed from wishlist', 'success');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            showToast('Failed to remove from wishlist', 'error');
        }
    };

    const handleAddToCart = (jersey) => {
        addToCart(jersey);
        showToast('Added to cart', 'success');
    };

    const handleMoveToCart = async (jersey) => {
        try {
            handleAddToCart(jersey);
            await handleRemoveFromWishlist(jersey.id);
            showToast('Moved to cart', 'success');
        } catch (error) {
            console.error('Error moving to cart:', error);
            showToast('Failed to move to cart', 'error');
        }
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
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 6 }}>
                {/* Hero Section */}
                <Box className="pastel-hero" sx={{ mb: 6 }}>
                    <Typography 
                        variant="h4" 
                        className="hero-title"
                        sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            mb: 2 
                        }}
                    >
                        My Wishlist
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        className="hero-subtitle"
                        sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            color: 'text.secondary' 
                        }}
                    >
                        Your favorite jerseys in one place
                    </Typography>
                </Box>

                {wishlist.length === 0 ? (
                    <Box 
                        sx={{ 
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 1
                        }}
                    >
                        <Typography 
                            variant="h6"
                            sx={{ 
                                color: 'text.secondary',
                                fontFamily: 'Poppins, sans-serif' 
                            }}
                        >
                            Your wishlist is empty
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {wishlist.map((jersey) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={jersey.id}>
                                <JerseyCard
                                    jersey={jersey}
                                    onRemoveFromWishlist={() => handleRemoveFromWishlist(jersey.id)}
                                    isInWishlist={true}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default WishlistPage;
