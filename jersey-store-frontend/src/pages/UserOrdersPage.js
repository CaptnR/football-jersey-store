// Updated UserOrdersPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    Card,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

const getStatusIcon = (status) => {
    switch (status) {
        case 'delivered':
            return <CheckCircleIcon sx={{ color: 'success.main' }} />;
        case 'shipped':
            return <LocalShippingIcon sx={{ color: 'info.main' }} />;
        case 'cancelled':
            return <CancelIcon sx={{ color: 'error.main' }} />;
        default:
            return <PendingIcon sx={{ color: 'warning.main' }} />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'delivered':
            return 'success';
        case 'shipped':
            return 'info';
        case 'cancelled':
            return 'error';
        default:
            return 'warning';
    }
};

function UserOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
                headers: { Authorization: `Token ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            setError('Failed to load orders');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
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
                    My Orders
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {orders.length === 0 ? (
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
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No orders yet
                        </Typography>
                        <Button
                            component={Link}
                            to="/"
                            variant="contained"
                            sx={{ mt: 2 }}
                        >
                            Start Shopping
                        </Button>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {orders.map((order) => (
                            <Grid item xs={12} key={order.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ p: 3 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={6}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    Order #{order.id}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Placed on: {new Date(order.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    ${order.total_price}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStatusIcon(order.status)}
                                                    <Chip
                                                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        color={getStatusColor(order.status)}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 2 }}>
                                            {order.items.map((item, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        py: 2,
                                                        borderTop: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={2} sm={1}>
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                style={{
                                                                    width: '100%',
                                                                    height: 'auto',
                                                                    maxWidth: '50px',
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={7} sm={9}>
                                                            <Typography variant="body1">
                                                                {item.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Quantity: {item.quantity}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={3} sm={2}>
                                                            <Typography variant="body1" align="right">
                                                                ${item.price * item.quantity}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            ))}
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

export default UserOrdersPage;
