// Updated CheckoutPage.js with Material-UI components and styling

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
    Container,
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Card,
    Grid,
    TextField,
    Button,
    Divider,
    Alert,
    CircularProgress,
} from '@mui/material';
import { API } from '../api/api';
import { CURRENCY } from '../utils/constants';

const steps = ['Shipping', 'Payment', 'Review'];

function CheckoutPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [shippingData, setShippingData] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });
    const [paymentData, setPaymentData] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { cartItems, calculateTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        handleNext();
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        handleNext();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format cart items based on type (custom or regular)
            const formattedItems = cartItems.map(item => {
                if (item.type === 'custom') {
                    return {
                        type: 'custom',
                        jersey_id: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        customization: {
                            name: item.playerName,
                            number: item.playerNumber,
                            primary_color: item.primaryColor,
                            secondary_color: item.secondaryColor
                        }
                    };
                } else {
                    return {
                        type: 'regular',
                        jersey_id: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        player: item.player
                    };
                }
            });

            const orderData = {
                items: formattedItems,
                total_price: calculateTotal(),
                payment: {
                    name_on_card: paymentData.cardName,
                    card_number: paymentData.cardNumber,
                    expiration_date: paymentData.expiryDate,
                }
            };

            console.log('Sending order data:', orderData); // Debug log

            const response = await API.post('/checkout/', orderData);

            if (response.status === 201) {
                clearCart();
                setSuccessMessage('Order placed successfully!');
                setTimeout(() => {
                    navigate('/orders');
                }, 2000);
            }
        } catch (error) {
            console.error('Checkout error:', error.response?.data || error.message);
            setError(error.response?.data?.error || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderOrderItem = (item) => {
        if (item.type === 'custom') {
            return {
                name: `Custom Jersey - ${item.playerName || 'Unnamed'}`,
                number: item.playerNumber || 'No number',
                price: item.price || 99.99,
                quantity: item.quantity || 1,
                primaryColor: item.primaryColor,
                secondaryColor: item.secondaryColor
            };
        } else {
            return {
                name: item.player?.name || 'Regular Jersey',
                team: item.player?.team?.name || '',
                price: item.price || 0,
                quantity: item.quantity || 1
            };
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box component="form" onSubmit={handleShippingSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={shippingData.fullName}
                                    onChange={(e) => setShippingData({
                                        ...shippingData,
                                        fullName: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Address"
                                    value={shippingData.address}
                                    onChange={(e) => setShippingData({
                                        ...shippingData,
                                        address: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="City"
                                    value={shippingData.city}
                                    onChange={(e) => setShippingData({
                                        ...shippingData,
                                        city: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Postal Code"
                                    value={shippingData.postalCode}
                                    onChange={(e) => setShippingData({
                                        ...shippingData,
                                        postalCode: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Continue to Payment
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box component="form" onSubmit={handlePaymentSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Name on Card"
                                    value={paymentData.cardName}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        cardName: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Card Number"
                                    value={paymentData.cardNumber}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        cardNumber: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Expiry Date"
                                    placeholder="MM/YY"
                                    value={paymentData.expiryDate}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        expiryDate: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="CVV"
                                    value={paymentData.cvv}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        cvv: e.target.value
                                    })}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Continue to Review
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        {cartItems.map((item) => {
                            const displayItem = renderOrderItem(item);
                            return (
                                <Box
                                    key={item.id}
                                    sx={{
                                        py: 2,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={8}>
                                            <Typography variant="subtitle1">
                                                {displayItem.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Quantity: {displayItem.quantity}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle1" align="right">
                                                {CURRENCY.symbol}{(displayItem.price * displayItem.quantity).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            );
                        })}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" align="right">
                                Total: {CURRENCY.symbol}{calculateTotal().toFixed(2)}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Place Order'}
                        </Button>
                    </Box>
                );

            default:
                return null;
        }
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
                    Checkout
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 4 }}>
                        {successMessage}
                    </Alert>
                )}

                <Card
                    elevation={0}
                    sx={{
                        p: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {renderStepContent(activeStep)}

                    {activeStep !== 0 && (
                        <Button
                            onClick={handleBack}
                            sx={{ mt: 3, mr: 1 }}
                        >
                            Back
                        </Button>
                    )}
                </Card>
            </Box>
        </Container>
    );
}

export default CheckoutPage;
