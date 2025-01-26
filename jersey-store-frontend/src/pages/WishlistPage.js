import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../api/api';
import { Link } from 'react-router-dom';
import './App.css';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await getWishlist(token);
                setWishlist(response.data);
            } catch (error) {
                console.error('Error fetching wishlist:', error.response || error.message);
            }
        };

        fetchWishlist();
    }, [token]);

    const handleRemove = async (jerseyId) => {
        try {
            await removeFromWishlist(token, jerseyId);
            setWishlist(wishlist.filter((jersey) => jersey.id !== jerseyId));
        } catch (error) {
            console.error('Error removing item from wishlist:', error.response || error.message);
        }
    };

    return (
        <main className="container">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
                Your Wishlist
            </h1>
            {wishlist.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
                    Your wishlist is empty. Start adding your favorite jerseys!
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {wishlist.map((jersey) => (
                        <div
                            key={jersey.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Link to={`/jersey/${jersey.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img
                                    src={jersey.image}
                                    alt={jersey.player.name}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '8px',
                                        objectFit: 'cover',
                                    }}
                                />
                            </Link>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                                    <Link to={`/jersey/${jersey.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                                        {jersey.player.name}
                                    </Link>
                                </h2>
                                <p style={{ margin: '0.5rem 0', fontSize: '1rem', color: '#333' }}>
                                    ${jersey.price}
                                </p>
                            </div>
                            <button
                                style={{
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleRemove(jersey.id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default WishlistPage;
