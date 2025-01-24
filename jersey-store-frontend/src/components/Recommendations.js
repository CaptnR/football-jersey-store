import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Recommendations() {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            const token = localStorage.getItem('token'); // Get the user's token
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/jerseys/recommendations/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include the token in the request
                    },
                });
                setRecommendations(response.data);
            } catch (error) {
                console.error('Error fetching recommendations:', error.response || error.message);
            }
        };

        fetchRecommendations();
    }, []);

    if (recommendations.length === 0) {
        return null; // Don't display the section if there are no recommendations
    }

    return (
        <section style={{ marginTop: '2rem' }}>
            <h2>Recommended for You</h2>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                {recommendations.map((jersey) => (
                    <div key={jersey.id} style={{ flex: '0 0 auto', width: '200px', textAlign: 'center' }}>
                        <Link to={`/jersey/${jersey.id}`}>
                            <img
                                src={jersey.image}
                                alt={jersey.player.name}
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                            <p>{jersey.player.name}</p>
                            <p>${jersey.price}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Recommendations;
