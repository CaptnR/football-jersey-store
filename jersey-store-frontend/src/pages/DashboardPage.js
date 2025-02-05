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
    Paper
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

    useEffect(() => {
        const checkAdminStatus = () => {
            const adminStatus = localStorage.getItem('is_admin') === 'true';
            console.log('Admin status:', adminStatus);
            console.log('is_admin in localStorage:', localStorage.getItem('is_admin'));
            setIsAdmin(adminStatus);
        };

        checkAdminStatus();
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/');
            console.log('Dashboard data:', response.data);
            setDashboardData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

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
                <Typography color="error" sx={{ py: 4 }}>
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard {isAdmin && '(Admin)'}
            </Typography>

            {/* Admin KPIs */}
            {isAdmin && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Key Performance Indicators
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6">Total Orders</Typography>
                                <Typography variant="h4">{dashboardData.kpis?.total_orders}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6">Total Revenue</Typography>
                                <Typography variant="h4">${dashboardData.kpis?.total_revenue}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6">Avg Order Value</Typography>
                                <Typography variant="h4">${dashboardData.kpis?.average_order_value}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6">Total Customers</Typography>
                                <Typography variant="h4">{dashboardData.kpis?.total_customers}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Recent Orders with enhanced admin controls */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {isAdmin ? 'Order Management' : 'Recent Orders'}
                </Typography>
                <Grid container spacing={3}>
                    {dashboardData.recent_orders?.map((order) => (
                        <Grid item xs={12} md={6} key={order.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            Order #{order.id}
                                        </Typography>
                                        {isAdmin && (
                                            <Typography variant="subtitle2">
                                                Customer: {order.user}
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    {/* Order Items with null check */}
                                    {order.items && Array.isArray(order.items) && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Items:
                                            </Typography>
                                            {order.items.map((item, index) => (
                                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2">
                                                        {item.player?.name || 'Unknown Jersey'} - {item.quantity || 1}x
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Total: ${order.total_price || 0}
                                    </Typography>
                                    
                                    {isAdmin ? (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Update Order Status:
                                            </Typography>
                                            {order.status !== ORDER_STATUSES.DELIVERED ? (
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Select
                                                        value={(order.status || ORDER_STATUSES.PENDING).toLowerCase()}
                                                        onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                                        size="small"
                                                        sx={{ minWidth: 200 }}
                                                    >
                                                        <MenuItem value={ORDER_STATUSES.PENDING}>Pending</MenuItem>
                                                        <MenuItem value={ORDER_STATUSES.PROCESSING}>Processing</MenuItem>
                                                        <MenuItem value={ORDER_STATUSES.SHIPPED}>Shipped</MenuItem>
                                                        <MenuItem value={ORDER_STATUSES.DELIVERED}>Delivered</MenuItem>
                                                        <MenuItem value={ORDER_STATUSES.CANCELLED}>Cancelled</MenuItem>
                                                    </Select>
                                                    <Typography 
                                                        sx={{ 
                                                            px: 2, 
                                                            py: 1, 
                                                            borderRadius: 1,
                                                            bgcolor: order.status?.toLowerCase() === ORDER_STATUSES.DELIVERED ? 'success.light' : 
                                                                     order.status?.toLowerCase() === ORDER_STATUSES.CANCELLED ? 'error.light' : 
                                                                     'info.light',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Current: {order.status ? 
                                                            order.status.charAt(0).toUpperCase() + order.status.toLowerCase().slice(1) : 
                                                            'Pending'}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography 
                                                    sx={{ 
                                                        px: 2, 
                                                        py: 1, 
                                                        borderRadius: 1,
                                                        bgcolor: 'success.light',
                                                        color: 'white',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    Delivered (Cannot be modified)
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography>Status:</Typography>
                                                <Typography 
                                                    sx={{ 
                                                        px: 1, 
                                                        py: 0.5, 
                                                        borderRadius: 1,
                                                        bgcolor: order.status === ORDER_STATUSES.DELIVERED ? 'success.light' : 
                                                                 order.status === ORDER_STATUSES.CANCELLED ? 'error.light' : 
                                                                 'info.light',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {order.status ? 
                                                        order.status.charAt(0).toUpperCase() + order.status.slice(1) : 
                                                        'Pending'}
                                                </Typography>
                                            </Box>
                                            {order.status !== ORDER_STATUSES.DELIVERED && order.status !== ORDER_STATUSES.CANCELLED && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Cancel Order
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                    
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Ordered on: {new Date(order.created_at).toLocaleDateString()}
                                        </Typography>
                                        {isAdmin && (
                                            <Typography variant="caption" 
                                                sx={{ 
                                                    color: order.status === ORDER_STATUSES.DELIVERED ? 'success.main' : 
                                                           order.status === ORDER_STATUSES.CANCELLED ? 'error.main' : 
                                                           'info.main'
                                                }}
                                            >
                                                Last Updated: {new Date(order.updated_at || order.created_at).toLocaleString()}
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* User-specific sections */}
            {!isAdmin && (
                <>
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
                                            <img 
                                                src={formatImageUrl(jersey.image)} 
                                                alt={jersey.player?.name || 'Jersey'}
                                                style={{ 
                                                    width: '100%', 
                                                    height: 'auto',
                                                    objectFit: 'contain' 
                                                }}
                                            />
                                            <Typography>
                                                {jersey.player?.name || 'Jersey'}
                                            </Typography>
                                            <Typography>
                                                ${jersey.price}
                                            </Typography>
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
                                            <img 
                                                src={formatImageUrl(jersey.image)} 
                                                alt={jersey.player?.name || 'Jersey'}
                                                style={{ 
                                                    width: '100%', 
                                                    height: 'auto',
                                                    objectFit: 'contain' 
                                                }}
                                            />
                                            <Typography>
                                                {jersey.player?.name || 'Jersey'}
                                            </Typography>
                                            <Typography>
                                                ${jersey.price}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </>
            )}

            {/* Add KPI section for admins */}
            {isAdmin && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Order Statistics
                    </Typography>
                    <Grid container spacing={2}>
                        {Object.entries(dashboardData.kpis?.orders_by_status || {}).map(([status, count]) => (
                            <Grid item xs={12} sm={6} md={4} key={status}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                        {status} Orders
                                    </Typography>
                                    <Typography variant="h4">{count}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
}

export default DashboardPage;
