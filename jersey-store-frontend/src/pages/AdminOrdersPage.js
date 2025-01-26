import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            if (!token) {
                alert('You must log in as an admin to view orders.');
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/orders/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in the Authorization header
                    },
                });
                setOrders(response.data); // Save the fetched orders
            } catch (error) {
                console.error('Error fetching admin orders:', error.response || error.message);
                alert('Failed to fetch admin orders. Please try again.');
            }
        };

        fetchOrders();
    }, []);

    return (
        <main className="container">
            <header>
                <h1>Admin Orders</h1>
            </header>
            {orders.length === 0 ? (
                <p>No orders available.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <h2>Order #{order.id}</h2>
                            <p>User: {order.user}</p>
                            <p>Status: {order.status}</p>
                            <p>Total Price: ${order.total_price}</p>
                            <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
            <footer>
                <p>&copy; 2023 Jersey Store</p>
            </footer>
        </main>
    );
}

export default AdminOrdersPage;
