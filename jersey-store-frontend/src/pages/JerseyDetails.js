import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJerseys, fetchPlayers, addToWishlist, removeFromWishlist } from '../api/api';
import { CartContext } from '../context/CartContext';

function JerseyDetails() {
    const { id } = useParams();
    const [jersey, setJersey] = useState(null);
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);

    // Wishlist state
    const [isWishlisted, setIsWishlisted] = useState(false);
    const token = localStorage.getItem('token'); // Get token from localStorage

    // Fetch jersey and player details
    useEffect(() => {
        fetchJerseys()
            .then((response) => {
                const selectedJersey = response.data.find((item) => item.id === parseInt(id));
                setJersey(selectedJersey);

                if (selectedJersey) return fetchPlayers();
                return Promise.reject("Jersey not found");
            })
            .then((response) => {
                const selectedPlayer = response.data.find((item) => item.id === jersey?.player);
                setPlayer(selectedPlayer);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching details:", error);
                setLoading(false);
            });
    }, [id, jersey?.player]);

    // Handle wishlist functionality
    const handleWishlist = async () => {
        try {
            if (isWishlisted) {
                await removeFromWishlist(token, jersey.id);
            } else {
                await addToWishlist(token, jersey.id);
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error updating wishlist:', error.response || error.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!jersey || !player) return <p>Jersey not found.</p>;

    return (
        <main className="container">
            <div className="card" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
                <img
                    src={jersey.image}
                    alt={`${player.name} Jersey`}
                    style={{
                        width: '300px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                    }}
                />
                <div>
                    <h1>{player.name} Jersey</h1>
                    <p><strong>Price:</strong> ${jersey.price}</p>
                    <p><strong>Team:</strong> {player.team?.name || "Unknown Team"}</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => addToCart(jersey)}
                            className="button-primary"
                        >
                            Add to Cart
                        </button>
                        <Link
                            to="/customize"
                            state={{ jerseyId: jersey.id }}
                            className="button-secondary"
                        >
                            Customize Jersey
                        </Link>
                        <button
                            onClick={handleWishlist}
                            className={`button-${isWishlisted ? 'secondary' : 'primary'}`}
                        >
                            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default JerseyDetails;
