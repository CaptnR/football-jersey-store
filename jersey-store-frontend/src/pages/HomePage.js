import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isLoggedIn, fetchJerseys } from '../api/api';
import Spinner from '../components/Spinner';

function HomePage() {
    const navigate = useNavigate();
    const [jerseys, setJerseys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        } else {
            fetchJerseys()
                .then((response) => {
                    setJerseys(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching jerseys:", error);
                    setError('Failed to load jerseys.');
                    setLoading(false);
                });
        }
    }, [navigate]);

    if (loading) return <Spinner />;
    if (error) return <p>{error}</p>;

    return (
        <main className="container">
            {/* Hero Section */}
            <section className="hero">
                <h1>Football Jersey Store</h1>
                <p>Discover jerseys of your favorite teams and players.</p>
                <button onClick={() => navigate('/customize')} className="button-primary">Customize Now</button>
            </section>

            {/* Jersey Grid */}
            <div className="grid">
                {jerseys.map((jersey) => (
                    <Link
                        key={jersey.id}
                        to={`/jersey/${jersey.id}`}
                        className="jersey-card"
                    >
                        <article>
                            <img src={jersey.image} alt="Jersey" />
                            <h2>${jersey.price}</h2>
                        </article>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default HomePage;
