import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, fetchJerseys } from '../api/api';

function HomePage() {
    const navigate = useNavigate();
    const [jerseys, setJerseys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        } else {
            fetchJerseys()
                .then((response) => {
                    setJerseys(response.data);
                    setLoading(false);
                })
                .catch((error) => console.error("Error fetching jerseys:", error));
        }
    }, [navigate]);

    if (loading) return <p>Loading...</p>;

    return (
        <main className="container">
            {/* Hero Section */}
            <section className="hero">
                <h1>Football Jersey Store</h1>
                <p>Discover jerseys of your favorite teams and players.</p>
                <button
                    onClick={() => navigate('/customize')}
                    className="button-primary"
                >
                    Customize Jersey
                </button>
            </section>

            {/* Jersey Grid */}
            <div className="grid">
    {jerseys.map((jersey) => (
        <Link key={jersey.id} to={`/jersey/${jersey.id}`} className="card">
            <img
                src={jersey.image} // Use the image URL from the API response
                alt="Jersey"
                style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                }}
            />
            <h2>${jersey.price}</h2>
        </Link>
                ))}
            </div>
        </main>
    );
}

export default HomePage;
