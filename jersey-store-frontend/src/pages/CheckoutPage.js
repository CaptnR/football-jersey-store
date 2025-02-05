// Updated CheckoutPage.js with Material-UI components and styling

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    Divider,
} from '@mui/material';

function CheckoutPage() {
    const { cart, clearCart } = useContext(CartContext);
    const [nameOnCard, setNameOnCard] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const orderDetails = {
            cart_items: cart, // Cart items
            total_price: totalPrice, // Total price
            payment: {
                name_on_card: nameOnCard,
                card_number: cardNumber,
                expiration_date: expirationDate,
            },
        };

        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            if (!token) {
                throw new Error('User is not authenticated. Token is missing.');
            }

            await axios.post('http://127.0.0.1:8000/api/checkout/', orderDetails, {
                headers: {
                    Authorization: `Token ${token}`, // Include token in Authorization header
                },
            });

            setSuccess(true);
            clearCart();
            setTimeout(() => navigate('/'), 2000); // Redirect after success
        } catch (error) {
            console.error('Error during checkout:', error.response || error.message);
            setError('Checkout failed. Please try again.');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Checkout
            </Typography>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Order placed successfully! Redirecting to the home page...
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Order Summary */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Order Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {cart.map((item) => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>{item.player?.name || 'Jersey'}</Typography>
                            <Typography>
                                ${item.price} x {item.quantity}
                            </Typography>
                        </Box>
                    ))}
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Total: ${totalPrice.toFixed(2)}
                    </Typography>
                </Grid>

                {/* Payment Form */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Payment Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                    >
                        <TextField
                            label="Name on Card"
                            variant="outlined"
                            value={nameOnCard}
                            onChange={(e) => setNameOnCard(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Card Number"
                            variant="outlined"
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                            inputProps={{ maxLength: 16 }}
                            fullWidth
                        />

                        <TextField
                            label="Expiration Date (MM/YY)"
                            variant="outlined"
                            type="text"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            required
                            inputProps={{ maxLength: 5 }}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                        >
                            Pay Now
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CheckoutPage;
