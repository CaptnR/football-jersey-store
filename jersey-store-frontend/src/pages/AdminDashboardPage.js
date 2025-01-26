// Updated AdminDashboardPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        total_sales: 0,
        total_users: 0,
        total_orders: 0,
        pending_orders: 0,
    });
    const [orders, setOrders] = useState([]);
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
                setMetrics(metricsResponse.data);

                // Fetch orders
                const ordersResponse = await axios.get('http://127.0.0.1:8000/api/admin/orders/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in Authorization header
                    },
                });
                setOrders(ordersResponse.data);
            } catch (err) {
                console.error('Error fetching admin data:', err.response || err.message);
                setError('Failed to load admin dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const updateOrderStatus = async (orderId, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`http://127.0.0.1:8000/api/admin/orders/${orderId}/`, { status }, {
                headers: {
                    Authorization: `Token ${token}`, // Include token in Authorization header
                },
            });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
        } catch (err) {
            console.error('Error updating order status:', err.response || err.message);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Metrics Section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {Object.entries(metrics).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {key.replace('_', ' ').toUpperCase()}
                                </Typography>
                                <Typography variant="h5">
                                    {key === 'total_sales' ? `$${value.toFixed(2)}` : value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Orders Section */}
            <Typography variant="h5" gutterBottom>
                Manage Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {orders.length === 0 ? (
                <Alert severity="info">No orders available.</Alert>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Total Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.user}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>${order.total_price}</TableCell>
                                <TableCell>
                                    <Select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        sx={{ width: '150px' }}
                                    >
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Shipped">Shipped</MenuItem>
                                        <MenuItem value="Delivered">Delivered</MenuItem>
                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Container>
    );
}

export default AdminDashboardPage;
