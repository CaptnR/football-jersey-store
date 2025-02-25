// Updated DashboardPage.js with Material-UI integration

import React, { useState, useEffect } from 'react';
import { API } from '../api/api';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Skeleton,
    Select,
    MenuItem,
    Button,
    Divider,
    Paper,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Add these constants at the top of the file
const ORDER_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

function DashboardPage() {
    const [dashboardData, setDashboardData] = useState({
        recent_orders: [],
        wishlist: [],
        recommendations: [],
        kpis: {
            total_orders: 0,
            total_revenue: 0,
            average_order_value: 0,
            total_customers: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await API.get('/dashboard/');
            console.log('Dashboard response:', response.data);

            // Check if we need to redirect to admin dashboard
            if (response.data.redirect === 'admin') {
                navigate('/admin/dashboard');
                return;
            }

            setDashboardData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await API.patch(`/orders/${orderId}/status/`, { 
                status: newStatus.toLowerCase() 
            });
            
            if (response.status === 200) {
                console.log('Order status updated successfully');
                fetchDashboardData(); // Refresh data after update
            }
        } catch (error) {
            console.error('Error updating order status:', error.response?.data || error.message);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await API.patch(`/orders/${orderId}/status/`, { 
                status: ORDER_STATUSES.CANCELLED 
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    const formatImageUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : `http://localhost:8000${url}`;
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={200} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            {/* Recent Orders */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Recent Orders
                </Typography>
                <Grid container spacing={3}>
                    {dashboardData.recent_orders?.map((order) => (
                        <Grid item xs={12} md={6} key={order.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        Order #{order.id}
                                    </Typography>
                                    <Typography>
                                        Total: ₹{order.total_price}
                                    </Typography>
                                    <Typography>
                                        Status: {order.status}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Wishlist */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Wishlist
                </Typography>
                <Grid container spacing={3}>
                    {dashboardData.wishlist?.map((jersey) => (
                        <Grid item xs={12} sm={6} md={4} key={jersey.id}>
                            <Card>
                                <CardContent>
                                    <Box 
                                        component="img"
                                        src={jersey.image}
                                        alt={jersey.player?.name}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <Typography variant="h6">
                                        {jersey.player?.name}'s Jersey
                                    </Typography>
                                    <Typography>
                                        ₹{jersey.price}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(`/jersey/${jersey.id}`)}
                                        sx={{ mt: 2 }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Recommendations */}
            <Box>
                <Typography variant="h5" gutterBottom>
                    Recommended for You
                </Typography>
                <Grid container spacing={3}>
                    {dashboardData.recommendations?.map((jersey) => (
                        <Grid item xs={12} sm={6} md={4} key={jersey.id}>
                            <Card>
                                <CardContent>
                                    <Box 
                                        component="img"
                                        src={jersey.image}
                                        alt={jersey.player?.name}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <Typography variant="h6">
                                        {jersey.player?.name}'s Jersey
                                    </Typography>
                                    <Typography>
                                        ₹{jersey.price}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(`/jersey/${jersey.id}`)}
                                        sx={{ mt: 2 }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}

export default DashboardPage;
