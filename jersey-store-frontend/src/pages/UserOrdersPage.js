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
                <p className="no-orders-message">You have no orders yet.</p>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <h2 className="order-title">Order #{order.id}</h2>
                            <div className="order-details">
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Total Price:</strong> ${order.total_price}</p>
                                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default UserOrdersPage;
