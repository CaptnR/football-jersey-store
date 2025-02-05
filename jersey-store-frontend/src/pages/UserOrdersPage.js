// Updated UserOrdersPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    CircularProgress,
} from '@mui/material';

function UserOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token'); // Get token from localStorage
            if (!token) {
                setError('You need to log in to view your orders.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in Authorization header
                    },
                });
                setOrders(response.data); // Save fetched orders in state
            } catch (err) {
                console.error('Error fetching orders:', err.response || err.message);
                setError('Failed to fetch orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Your Orders
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {orders.length === 0 ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    You have no orders yet.
                </Alert>
            ) : (
                <Grid container spacing={4}>
                    {orders.map((order) => (
                        <Grid item xs={12} sm={6} md={4} key={order.id}>
                            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Order #{order.id}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Status:</strong> {order.status}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Total Price:</strong> ${order.total_price}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default UserOrdersPage;
