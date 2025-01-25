import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardPage() {
    const [recentOrders, setRecentOrders] = useState([]); // State for recent orders
    const [wishlist, setWishlist] = useState([]); // State for wishlist items
    const [recommendations, setRecommendations] = useState([]); // State for recommendations
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(''); // Error state for debugging

    useEffect(() => {
        const token = localStorage.getItem('token'); // Get the user's token

        axios
            .get('http://127.0.0.1:8000/api/dashboard/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
            .then((response) => {
                console.log('Dashboard API Response:', response.data); // Log API response

                // Extract and set data from the API response
                setRecentOrders(response.data.recent_orders || []);
                setWishlist(response.data.wishlist || []);
                setRecommendations(response.data.recommendations || []);
                setLoading(false); // Stop loading
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to fetch dashboard data'); // Set error state
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <main className="container">
            <h1>Dashboard</h1>

            {/* Recent Orders Section */}
            <section style={{ marginBottom: '20px' }}>
                <h2>Recent Orders</h2>
                {recentOrders.length > 0 ? (
                    <div className="grid">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="card">
                                <p><strong>Order ID:</strong> {order.id}</p>
                                <p><strong>Total Price:</strong> ${order.total_price}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recent orders available.</p>
                )}
            </section>

            {/* Wishlist Section */}
            <section style={{ marginBottom: '20px' }}>
                <h2>Wishlist</h2>
                {wishlist.length > 0 ? (
                    <div className="grid">
                        {wishlist.map((item) => (
                            <div key={item.id} className="card">
                                <img
                                    src={item.image.startsWith('/jerseys')
                                        ? `http://127.0.0.1:8000${item.image}`
                                        : item.image}
                                    alt="Wishlist Item"
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                />
                                <h3>${item.price}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No items in the wishlist.</p>
                )}
            </section>

            {/* Recommendations Section */}
            <section style={{ marginBottom: '20px' }}>
                <h2>Recommendations</h2>
                {recommendations.length > 0 ? (
                    <div className="grid">
                        {recommendations.map((item) => (
                            <div key={item.id} className="card">
                                <img
                                    src={item.image.startsWith('/jerseys')
                                        ? `http://127.0.0.1:8000${item.image}`
                                        : item.image}
                                    alt="Recommendation"
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                />
                                <h3>${item.price}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recommendations available.</p>
                )}
            </section>
        </main>
    );
}

export default DashboardPage;
