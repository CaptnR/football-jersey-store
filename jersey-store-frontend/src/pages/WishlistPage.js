import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../api/api';
import { Link } from 'react-router-dom';

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
            <h1>Your Wishlist</h1>
            {wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {wishlist.map((jersey) => (
                        <li key={jersey.id} style={{ marginBottom: '1rem' }}>
                            <Link to={`/jersey/${jersey.id}`}>
                                <img
                                    src={jersey.image}
                                    alt={jersey.player.name}
                                    style={{ width: '100px', marginRight: '1rem' }}
                                />
                                {jersey.player.name} - ${jersey.price}
                            </Link>
                            <button
                                style={{ marginLeft: '1rem', color: 'red' }}
                                onClick={() => handleRemove(jersey.id)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default WishlistPage;
