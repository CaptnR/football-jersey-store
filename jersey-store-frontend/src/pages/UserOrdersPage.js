import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserOrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token'); // Get token from localStorage
            if (!token) {
                alert('You need to log in to view your orders.');
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in Authorization header
                    },
                });
                setOrders(response.data); // Save fetched orders in state
            } catch (error) {
                console.error('Error fetching orders:', error.response || error.message);
                alert('Failed to fetch orders. Please try again later.');
            }
        };

        fetchOrders();
    }, []);

    return (
        <main className="container">
            <h1>Your Orders</h1>
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <h2>Order #{order.id}</h2>
                            <p>Status: {order.status}</p>
                            <p>Total Price: ${order.total_price}</p>
                            <p>Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default UserOrdersPage;
