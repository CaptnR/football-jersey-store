// Updated DashboardPage.js with Material-UI integration

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CircularProgress,
    Alert,
} from '@mui/material';

function DashboardPage() {
    const [recentOrders, setRecentOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios
            .get('http://127.0.0.1:8000/api/dashboard/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
            .then((response) => {
                setRecentOrders(response.data.recent_orders || []);
                setWishlist(response.data.wishlist || []);
                setRecommendations(response.data.recommendations || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to fetch dashboard data');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm">
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" gutterBottom>
                Dashboard
            </Typography>

            {/* Recent Orders Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Recent Orders
                </Typography>
                {recentOrders.length > 0 ? (
                    <Grid container spacing={4}>
                        {recentOrders.map((order) => (
                            <Grid item xs={12} sm={6} md={4} key={order.id}>
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="body1">
                                            <strong>Order ID:</strong> {order.id}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Total Price:</strong> ${order.total_price}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Status:</strong> {order.status}
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No recent orders available.</Typography>
                )}
            </Box>

            {/* Wishlist Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Wishlist
                </Typography>
                {wishlist.length > 0 ? (
                    <Grid container spacing={4}>
                        {wishlist.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={
                                            item.image.startsWith('/jerseys')
                                                ? `http://127.0.0.1:8000${item.image}`
                                                : item.image
                                        }
                                        alt="Wishlist Item"
                                    />
                                    <CardContent>
                                        <Typography variant="h6">${item.price}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No items in wishlist.</Typography>
                )}
            </Box>

            {/* Recommendations Section */}
            <Box>
                <Typography variant="h4" gutterBottom>
                    Recommendations
                </Typography>
                {recommendations.length > 0 ? (
                    <Grid container spacing={4}>
                        {recommendations.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={
                                            item.image.startsWith('/jerseys')
                                                ? `http://127.0.0.1:8000${item.image}`
                                                : item.image
                                        }
                                        alt="Recommendation"
                                    />
                                    <CardContent>
                                        <Typography variant="h6">${item.price}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No recommendations available.</Typography>
                )}
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    &copy; 2023 Jersey Store
                </Typography>
            </Box>
        </Container>
    );
}

export default DashboardPage;
