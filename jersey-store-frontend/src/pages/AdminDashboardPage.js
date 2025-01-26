import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboardPage() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        total_sales: 0,
        total_users: 0,
        total_orders: 0,
        pending_orders: 0,
    });
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token'); // Get token from localStorage
            if (!token) {
                alert('You need to log in as an admin.');
                navigate('/login'); // Redirect to login if not authenticated
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
            } catch (error) {
                console.error('Error fetching admin data:', error.response || error.message);
                alert('Failed to load admin dashboard data.');
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
            alert('Order status updated successfully.');
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status } : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error.response || error.message);
        }
    };

    return (
        <main className="container">
            <header>
                <h1>Admin Dashboard</h1>
            </header>
            <section>
                <h2>Key Metrics</h2>
                <ul>
                    <li>Total Sales: ${metrics.total_sales.toFixed(2)}</li>
                    <li>Total Users: {metrics.total_users}</li>
                    <li>Total Orders: {metrics.total_orders}</li>
                    <li>Pending Orders: {metrics.pending_orders}</li>
                </ul>
            </section>
            <section>
                <h2>Manage Orders</h2>
                {orders.length === 0 ? (
                    <p>No orders available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Total Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.user}</td>
                                    <td>{order.status}</td>
                                    <td>${order.total_price}</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <footer>
                <p>&copy; 2023 Jersey Store</p>
            </footer>
        </main>
    );
}

export default AdminDashboardPage;
