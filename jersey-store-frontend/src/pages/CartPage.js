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
} from '@mui/material';

function CartPage() {
    const { cart, addToCart, removeFromCart, decreaseQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Your Cart
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Your cart is empty. <Link to="/">Continue Shopping</Link>
                </Typography>
            </Container>
        );
    }

    const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Your Cart
            </Typography>

            <Grid container spacing={4}>
                {cart.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                            <CardMedia
                                component="img"
                                image={item.image}
                                alt="Jersey"
                                sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                            />
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    {item.player?.name || "Jersey"}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    ${item.price} x {item.quantity}
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => decreaseQuantity(item.id)}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => addToCart(item)}
                                    >
                                        +
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Total: ${totalPrice.toFixed(2)}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/checkout')}
                >
                    Checkout
                </Button>
            </Box>
        </Container>
    );
}

export default CartPage;
