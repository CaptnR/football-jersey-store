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

const validateShippingData = (data) => {
    const errors = {};
    
    if (!data.fullName.trim()) {
        errors.fullName = 'Full name is required';
    } else if (data.fullName.length < 3) {
        errors.fullName = 'Name must be at least 3 characters long';
    } else if (!/^[a-zA-Z\s]*$/.test(data.fullName)) {
        errors.fullName = 'Name should only contain letters';
    }

    if (!data.address.trim()) {
        errors.address = 'Address is required';
    } else if (data.address.length < 10) {
        errors.address = 'Please enter a complete address';
    }

    if (!data.city.trim()) {
        errors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]*$/.test(data.city)) {
        errors.city = 'City should only contain letters';
    }

    if (!data.postalCode.trim()) {
        errors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(data.postalCode)) {
        errors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    if (!data.country.trim()) {
        errors.country = 'Country is required';
    } else if (!/^[a-zA-Z\s]*$/.test(data.country)) {
        errors.country = 'Country should only contain letters';
    }

    return errors;
};

const validatePaymentData = (data) => {
    const errors = {};

    if (!data.cardName.trim()) {
        errors.cardName = 'Name on card is required';
    } else if (!/^[a-zA-Z\s]*$/.test(data.cardName)) {
        errors.cardName = 'Card name should only contain letters';
    }

    if (!data.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!data.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/([2-9]\d)$/.test(data.expiryDate)) {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
        // Check if card is not expired
        const [month, year] = data.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
            errors.expiryDate = 'Card has expired';
        }
    }

    if (!data.cvv.trim()) {
        errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(data.cvv)) {
        errors.cvv = 'Please enter a valid CVV';
    }

    return errors;
};

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
    const [shippingErrors, setShippingErrors] = useState({});
    const [paymentErrors, setPaymentErrors] = useState({});
    
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
        const errors = validateShippingData(shippingData);
        setShippingErrors(errors);

        if (Object.keys(errors).length === 0) {
            handleNext();
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        const errors = validatePaymentData(paymentData);
        setPaymentErrors(errors);

        if (Object.keys(errors).length === 0) {
            handleNext();
        }
    };

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (shippingErrors[name]) {
            setShippingErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value;
        }

        // Format expiry date
        if (name === 'expiryDate') {
            formattedValue = value
                .replace(/\D/g, '')
                .replace(/^(\d{2})/, '$1/')
                .substr(0, 5);
        }

        setPaymentData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        // Clear error when user starts typing
        if (paymentErrors[name]) {
            setPaymentErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format the order data
            const orderData = {
                items: cartItems.map(item => ({
                    jersey_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size || 'M',
                    type: item.type || 'regular',
                    player_name: item.player?.name || ''
                })),
                total_price: calculateTotal()
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
            console.error('Checkout error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to place order';
            setError(errorMessage);
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
                size: item.size || 'M',
                primaryColor: item.primaryColor,
                secondaryColor: item.secondaryColor
            };
        } else {
            return {
                name: item.player?.name || 'Regular Jersey',
                team: item.player?.team?.name || '',
                price: item.price || 0,
                quantity: item.quantity || 1,
                size: item.size || 'M'
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
                                    name="fullName"
                                    value={shippingData.fullName}
                                    onChange={handleShippingChange}
                                    margin="normal"
                                    error={!!shippingErrors.fullName}
                                    helperText={shippingErrors.fullName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={shippingData.address}
                                    onChange={handleShippingChange}
                                    margin="normal"
                                    error={!!shippingErrors.address}
                                    helperText={shippingErrors.address}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={shippingData.city}
                                    onChange={handleShippingChange}
                                    margin="normal"
                                    error={!!shippingErrors.city}
                                    helperText={shippingErrors.city}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Postal Code"
                                    name="postalCode"
                                    value={shippingData.postalCode}
                                    onChange={handleShippingChange}
                                    margin="normal"
                                    error={!!shippingErrors.postalCode}
                                    helperText={shippingErrors.postalCode}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Country"
                                    name="country"
                                    value={shippingData.country}
                                    onChange={handleShippingChange}
                                    margin="normal"
                                    error={!!shippingErrors.country}
                                    helperText={shippingErrors.country}
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
                                    name="cardName"
                                    value={paymentData.cardName}
                                    onChange={handlePaymentChange}
                                    margin="normal"
                                    error={!!paymentErrors.cardName}
                                    helperText={paymentErrors.cardName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Card Number"
                                    name="cardNumber"
                                    value={paymentData.cardNumber}
                                    onChange={handlePaymentChange}
                                    margin="normal"
                                    error={!!paymentErrors.cardNumber}
                                    helperText={paymentErrors.cardNumber}
                                    inputProps={{ maxLength: 19 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Expiry Date"
                                    name="expiryDate"
                                    value={paymentData.expiryDate}
                                    onChange={handlePaymentChange}
                                    margin="normal"
                                    error={!!paymentErrors.expiryDate}
                                    helperText={paymentErrors.expiryDate}
                                    placeholder="MM/YY"
                                    inputProps={{ maxLength: 5 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="CVV"
                                    name="cvv"
                                    value={paymentData.cvv}
                                    onChange={handlePaymentChange}
                                    margin="normal"
                                    error={!!paymentErrors.cvv}
                                    helperText={paymentErrors.cvv}
                                    type="password"
                                    inputProps={{ maxLength: 4 }}
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
                                                Quantity: {displayItem.quantity} | Size: {displayItem.size}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="subtitle1" align="right">
                                                ₹{(displayItem.price * displayItem.quantity).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            );
                        })}
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" align="right">
                                ₹{calculateTotal().toFixed(2)}
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
