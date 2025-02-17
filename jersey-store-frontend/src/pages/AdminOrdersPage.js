// Updated AdminOrdersPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
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
    Select,
    MenuItem,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';

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

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/admin/orders/', {
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

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://127.0.0.1:8000/api/admin/orders/${orderId}/`,
                { status: newStatus },
                { headers: { Authorization: `Token ${token}` } }
            );
            
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchQuery) ||
            order.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                    Order Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                <Card
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <MenuItem value="all">All Orders</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="shipped">Shipped</MenuItem>
                                    <MenuItem value="delivered">Delivered</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Card>

                <Grid container spacing={3}>
                    {filteredOrders.map((order) => (
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
                                        <Grid item xs={12} sm={4}>
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
                                                Customer: {order.user}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Date: {new Date(order.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                ${order.total_price}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={5}>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        backgroundColor: 'white',
                                                    }}
                                                >
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="shipped">Shipped</MenuItem>
                                                    <MenuItem value="delivered">Delivered</MenuItem>
                                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                                </Select>
                                            </FormControl>
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
            </Box>
        </Container>
    );
}

export default AdminOrdersPage;
