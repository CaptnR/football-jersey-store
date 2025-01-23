import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJerseys, fetchPlayers } from '../api/api';

function JerseyDetails() {
    const { id } = useParams();
    const [jersey, setJersey] = useState(null);
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJerseys()
            .then((response) => {
                const selectedJersey = response.data.find((item) => item.id === parseInt(id));
                setJersey(selectedJersey);

                if (selectedJersey) return fetchPlayers();
                return Promise.reject("Jersey not found");
            })
            .then((response) => {
                const selectedPlayer = response.data.find((item) => item.id === jersey.player);
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
            <div style={{ display: 'flex', gap: '20px' }}>
                <img src={jersey.image} alt={`${player.name} Jersey`} style={{ width: '300px', borderRadius: '8px' }} />
                <div>
                    <p><strong>Price:</strong> ${jersey.price}</p>
                    <p><strong>Team:</strong> {player.team?.name || "Unknown Team"}</p>
                    <Link to="/customize" state={{ jerseyId: jersey.id }} role="button" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', textDecoration: 'none' }}>
                        Customize Jersey
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default JerseyDetails;
