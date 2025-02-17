// Updated AdminDashboardPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    TrendingUp,
    ShoppingCart,
    LocalShipping,
    CheckCircle,
    Cancel,
    AttachMoney,
} from '@mui/icons-material';

function StatCard({ title, value, icon, color }) {
    return (
        <Card
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                    sx={{
                        backgroundColor: `${color}.light`,
                        borderRadius: 2,
                        p: 1,
                        mr: 2,
                    }}
                >
                    {icon}
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                    }}
                >
                    {title}
                </Typography>
            </Box>
            <Typography
                variant="h4"
                sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    color: `${color}.main`,
                }}
            >
                {value}
            </Typography>
        </Card>
    );
}

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token'); // Get token from localStorage
            if (!token) {
                setError('You need to log in as an admin.');
                navigate('/login'); // Redirect to login if not authenticated
                setLoading(false);
                return;
            }

            try {
                // Fetch admin metrics
                const metricsResponse = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in Authorization header
                    },
                });
                setStats(metricsResponse.data);
            } catch (err) {
                console.error('Error fetching admin data:', err.response || err.message);
                setError('Failed to load admin dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

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
                    Admin Dashboard
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Total Revenue"
                            value={`$${stats?.totalRevenue.toLocaleString()}`}
                            icon={<AttachMoney sx={{ color: 'success.main' }} />}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Total Orders"
                            value={stats?.totalOrders}
                            icon={<ShoppingCart sx={{ color: 'primary.main' }} />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Average Order Value"
                            value={`$${stats?.averageOrderValue.toFixed(2)}`}
                            icon={<TrendingUp sx={{ color: 'info.main' }} />}
                            color="info"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Pending Orders"
                            value={stats?.pendingOrders}
                            icon={<LocalShipping sx={{ color: 'warning.main' }} />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Delivered Orders"
                            value={stats?.deliveredOrders}
                            icon={<CheckCircle sx={{ color: 'success.main' }} />}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Cancelled Orders"
                            value={stats?.cancelledOrders}
                            icon={<Cancel sx={{ color: 'error.main' }} />}
                            color="error"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            mb: 3,
                        }}
                    >
                        Recent Activity
                    </Typography>
                    <Card
                        elevation={0}
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        {stats?.recentOrders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                Order #{order.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="body1">
                                                Customer: {order.user}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                ${order.total_price}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                                {index < stats.recentOrders.length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default AdminDashboardPage;
