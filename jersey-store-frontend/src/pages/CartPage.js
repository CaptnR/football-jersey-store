// Updated CartPage.js with Material-UI components and styling

import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    TextField,
    IconButton,
    InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingOverlay from '../components/LoadingOverlay';
import { useToast } from '../context/ToastContext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PLACEHOLDER_IMAGE } from '../constants';

function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, loading } = useContext(CartContext);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Add this console log
    console.log('Cart Items:', cartItems);

    const items = (Array.isArray(cartItems) && cartItems) || [];

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
        showToast('Item removed from cart', 'info');
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            showToast('Quantity must be at least 1', 'warning');
            return;
        }
        updateQuantity(itemId, newQuantity);
        showToast('Cart updated', 'success');
    };

    const handleQuantityChange = (itemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity >= 1) {
            handleUpdateQuantity(itemId, newQuantity);
        }
    };

    const getItemImage = (item) => {
        if (item.type === 'custom') {
            return PLACEHOLDER_IMAGE;
        }
        return item.primary_image || PLACEHOLDER_IMAGE;
    };

    return (
        <Container maxWidth="lg">
            <LoadingOverlay loading={loading}>
                <Box sx={{ py: 6 }}>
                    <Typography 
                        variant="h4" 
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            mb: 4,
                        }}
                    >
                        Shopping Cart
                    </Typography>

                    {(!items || items.length === 0) ? (
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
                                Your cart is empty
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
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={8}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    {items.map((item) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                p: 2,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                '&:last-child': {
                                                    borderBottom: 'none',
                                                },
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={3}>
                                                    <Box
                                                        sx={{
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '200px',
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1,
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <CardMedia
                                                            component="img"
                                                            image={getItemImage(item)}
                                                            alt={item.type === 'custom' ? 'Custom Jersey' : item.player?.name}
                                                            sx={{ 
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'contain'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={9}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Typography variant="h6">
                                                            {item.type === 'custom' ? `Custom Jersey - ${item.name}` : `${item.player?.name}'s Jersey`}
                                                        </Typography>
                                                        <Typography variant="h6" color="primary">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 2,
                                                        mb: 2 
                                                    }}>
                                                        {/* Quantity Controls */}
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            borderRadius: '8px',
                                                            bgcolor: '#fff',
                                                            height: '40px',
                                                            minWidth: '120px',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <IconButton 
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                                disabled={item.quantity <= 1}
                                                                sx={{ 
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    '&:hover:not(:disabled)': {
                                                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                                    }
                                                                }}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>

                                                            <Typography 
                                                                variant="body1"
                                                                sx={{ 
                                                                    fontWeight: 600,
                                                                    userSelect: 'none',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    minWidth: '40px'
                                                                }}
                                                            >
                                                                {item.quantity}
                                                            </Typography>

                                                            <IconButton 
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                                sx={{ 
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '8px',
                                                                    '&:hover': {
                                                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                                    }
                                                                }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>

                                                        {/* Remove Button */}
                                                        <Button
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            color="error"
                                                            variant="outlined"
                                                            size="medium"
                                                            sx={{
                                                                height: '40px',
                                                                borderRadius: '8px',
                                                                '&:hover': {
                                                                    bgcolor: 'error.lighter',
                                                                    borderColor: 'error.main'
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        position: 'sticky',
                                        top: 24,
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Order Summary
                                    </Typography>
                                    <Box sx={{ my: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography>Subtotal</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography align="right">
                                                    ₹{(calculateTotal()).toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate('/checkout')}
                                        sx={{
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </LoadingOverlay>
        </Container>
    );
}

export default CartPage;
