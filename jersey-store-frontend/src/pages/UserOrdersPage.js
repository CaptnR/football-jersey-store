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
import { API } from '../api/api';
import LoadingOverlay from '../components/LoadingOverlay';

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
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/orders/my_orders/');
            setOrders(response.data || []); // Ensure we always have an array
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
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
            <LoadingOverlay loading={loading}>
                <Box sx={{ py: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        My Orders
                    </Typography>

                    {orders.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <Typography>You haven't placed any orders yet.</Typography>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {orders.map((order) => (
                                <Grid item xs={12} key={order.id}>
                                    <Card sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6">
                                                Order #{order.id}
                                            </Typography>
                                            <Chip
                                                label={order.status}
                                                color={
                                                    order.status === 'delivered' ? 'success' :
                                                    order.status === 'processing' ? 'info' :
                                                    order.status === 'cancelled' ? 'error' : 'default'
                                                }
                                            />
                                        </Box>
                                        <Typography color="text.secondary" gutterBottom>
                                            Placed on: {new Date(order.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                            Total: ₹{order.total_price}
                                        </Typography>
                                        
                                        {/* Order Items */}
                                        {order.items && order.items.map((item, index) => (
                                            <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                                <Typography>
                                                    {item.player_name} Jersey - Quantity: {item.quantity}
                                                </Typography>
                                                <Typography color="text.secondary">
                                                    ${item.price} each
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </LoadingOverlay>
        </Container>
    );
}

export default UserOrdersPage;
