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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { API, updateOrderStatus } from '../api/api';
import LoadingOverlay from '../components/LoadingOverlay';
import { useToast } from '../context/ToastContext';

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

const STATUS_COLORS = {
    pending: {
        color: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    processing: {
        color: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderColor: 'rgba(33, 150, 243, 0.3)',
    },
    shipped: {
        color: '#673AB7',
        backgroundColor: 'rgba(103, 58, 183, 0.1)',
        borderColor: 'rgba(103, 58, 183, 0.3)',
    },
    delivered: {
        color: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    cancelled: {
        color: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderColor: 'rgba(244, 67, 54, 0.3)',
    },
};

function UserOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const fetchOrders = async () => {
        try {
            const response = await API.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            setError('Failed to fetch orders');
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'cancelled');
            showToast('Order cancelled successfully', 'success');
            fetchOrders(); // Refresh orders list
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to cancel order', 'error');
        }
    };

    const canCancelOrder = (status) => {
        return ['pending', 'processing'].includes(status.toLowerCase());
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
                        <Card 
                            elevation={0}
                            sx={{ 
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>#{order.id}</TableCell>
                                                <TableCell>
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>₹{order.total_price}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={order.status.toUpperCase()}
                                                        sx={{
                                                            ...STATUS_COLORS[order.status.toLowerCase()],
                                                            border: '1px solid',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {canCancelOrder(order.status) && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleCancelOrder(order.id)}
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}
                </Box>
            </LoadingOverlay>
        </Container>
    );
}

export default UserOrdersPage;
