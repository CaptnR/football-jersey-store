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
    Alert,
    CardMedia
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

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
            setLoading(true);
            const response = await API.get('/dashboard/');
            console.log('Dashboard data:', response.data);
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

            {/* Recent Orders with View All Button */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">
                        Recent Orders
                    </Typography>
                    <Button 
                        component={Link} 
                        to="/orders" 
                        variant="outlined" 
                        color="primary"
                    >
                        View All Orders
                    </Button>
                </Box>
                
                <Grid container spacing={3}>
                    {dashboardData.recent_orders?.map((order) => (
                        <Grid item xs={12} sm={6} md={4} key={order.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        Order #{order.id}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </Typography>
                                    
                                    {/* Order Items with Size */}
                                    {order.items && order.items.map((item, index) => (
                                        <Box key={index} sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                            <Typography variant="body2">
                                                {item.player_name} Jersey
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                                                <Typography variant="caption">
                                                    Qty: {item.quantity}
                                                </Typography>
                                                <Typography variant="caption">
                                                    Size: {item.size}
                                                </Typography>
                                            </Box>
                                            {/* Add link to jersey details */}
                                            <Button 
                                                component={Link} 
                                                to={`/jersey/${item.jersey}`} 
                                                size="small" 
                                                sx={{ mt: 0.5, fontSize: '0.75rem' }}
                                            >
                                                View Jersey
                                            </Button>
                                        </Box>
                                    ))}
                                    
                                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                        Total: ₹{order.total_price}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Status: {order.status}
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
                                    <CardMedia
                                        component="img"
                                        image={jersey.primary_image || '/placeholder.jpg'}
                                        alt={jersey.player?.name}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.jpg';
                                        }}
                                    />
                                    <Typography variant="h6">
                                        {jersey.player?.name}'s Jersey
                                    </Typography>
                                    <Typography>
                                        ₹{jersey.price}
                                    </Typography>
                                    <Button
                                        component={Link} 
                                        to={`/jersey/${jersey.id}`} 
                                        variant="contained" 
                                        color="primary" 
                                        size="small" 
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
                                    <CardMedia
                                        component="img"
                                        src={jersey.primary_image || '/placeholder.jpg'}
                                        alt={jersey.player?.name}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.jpg';
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
