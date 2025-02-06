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
    
    const { cartItems, calculateTotal } = useContext(CartContext);
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

    const handleOrderSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            // Order submission logic here
            navigate('/orders');
        } catch (error) {
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
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
                        {cartItems.map((item) => (
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
                                            {item.player.name} Jersey
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Quantity: {item.quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="subtitle1" align="right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" align="right">
                                Total: ${calculateTotal().toFixed(2)}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleOrderSubmit}
                            disabled={loading}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Place Order'}
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
