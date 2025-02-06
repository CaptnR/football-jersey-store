// Updated WishlistPage.js with Material-UI components and styling

import React, { useState, useEffect, useContext } from 'react';
import { getWishlist, removeFromWishlist } from '../api/api';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    Button,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await getWishlist(token);
            setWishlistItems(response.data);
        } catch (error) {
            setError('Failed to load wishlist');
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (jerseyId) => {
        try {
            await removeFromWishlist(jerseyId);
            setWishlistItems(wishlistItems.filter(item => item.id !== jerseyId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 6 }}>
                <Typography 
                    variant="h4" 
                    sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        mb: 4,
                    }}
                >
                    My Wishlist
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {(!wishlistItems || wishlistItems.length === 0) ? (
                    <Card 
                        elevation={0}
                        sx={{ 
                            p: 6,
                            textAlign: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            Your wishlist is empty
                        </Typography>
                        <Button
                            component={Link}
                            to="/"
                            variant="contained"
                            sx={{ mt: 2 }}
                        >
                            Continue Shopping
                        </Button>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {wishlistItems.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <Box sx={{ position: 'relative', pt: '100%' }}>
                                        <CardMedia
                                            component="img"
                                            image={item.image}
                                            alt={item.player.name}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                p: 2,
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ p: 2, flexGrow: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                            }}
                                        >
                                            {item.player.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {item.player.team.name}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="primary"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 2,
                                            }}
                                        >
                                            ${item.price}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<ShoppingCartIcon />}
                                                onClick={() => addToCart(item)}
                                            >
                                                Add to Cart
                                            </Button>
                                            <IconButton
                                                onClick={() => handleRemoveFromWishlist(item.id)}
                                                color="error"
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Container>
    );
}

export default WishlistPage;
