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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    // Ensure cartItems is an array
    const items = Array.isArray(cartItems) ? cartItems : [];

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

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
                                                <CardMedia
                                                    component="img"
                                                    image={item.image}
                                                    alt={item.player?.name}
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            </Grid>
                                            <Grid item xs={9}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="h6">
                                                        {item.player?.name} Jersey
                                                    </Typography>
                                                    <Typography variant="h6" color="primary">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <TextField
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        InputProps={{ inputProps: { min: 1 } }}
                                                        sx={{ width: '100px' }}
                                                    />
                                                    <Button
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => removeFromCart(item.id)}
                                                        color="error"
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
                                                ${calculateTotal().toFixed(2)}
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
        </Container>
    );
}

export default CartPage;
