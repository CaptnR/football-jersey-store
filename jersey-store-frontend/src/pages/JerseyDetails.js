import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJerseys, fetchPlayers } from '../api/api';
import { CartContext } from '../context/CartContext';

function JerseyDetails() {
    const { id } = useParams(); // Extract the jersey ID from the URL
    const [jersey, setJersey] = useState(null); // State for jersey data
    const [player, setPlayer] = useState(null); // State for player data
    const [loading, setLoading] = useState(true); // State for loading spinner
    const { addToCart } = useContext(CartContext); // Access the cart context

    useEffect(() => {
        // Fetch the jersey and player data
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

    if (loading) return <p>Loading...</p>;
    if (!jersey || !player) return <p>Jersey not found.</p>;

    return (
        <main className="container">
            <h1>{player.name} Jersey</h1>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Jersey Image */}
                <img
                    src={jersey.image}
                    alt={`${player.name} Jersey`}
                    style={{ width: '300px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
                <div>
                    {/* Jersey Details */}
                    <p><strong>Price:</strong> ${jersey.price}</p>
                    <p><strong>Team:</strong> {player.team?.name || "Unknown Team"}</p>

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => addToCart(jersey)} // Add jersey to the cart
                        style={{
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '10px',
                        }}
                    >
                        Add to Cart
                    </button>

                    {/* Customize Jersey Button */}
                    <Link
                        to="/customize"
                        state={{ jerseyId: jersey.id }} // Pass the jersey ID to the customize page
                        style={{
                            padding: '10px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '5px',
                        }}
                    >
                        Customize Jersey
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default JerseyDetails;
