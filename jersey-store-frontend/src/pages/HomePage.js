import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, fetchJerseys } from '../api/api';
import Recommendations from '../components/Recommendations';
import axios from 'axios';

function HomePage() {
    const navigate = useNavigate();
    const [jerseys, setJerseys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [filters, setFilters] = useState({
        player: '',
        league: '',
        team: '',
        minPrice: 0,
        maxPrice: 100,
    });
    const [metadata, setMetadata] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        } else {
            fetchAllJerseys();
            fetchFilterMetadata();
        }
    }, [navigate]);

    const fetchAllJerseys = (query = '') => {
        setLoading(true);
        fetchJerseys(query)
            .then((response) => {
                setJerseys(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching jerseys:", error);
                setLoading(false);
            });
    };

    const fetchFilterMetadata = () => {
        const token = localStorage.getItem('token');
        axios
            .get('http://127.0.0.1:8000/api/metadata/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
            })
            .then((response) => {
                setMetadata(response.data);
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    minPrice: response.data.price_range.min,
                    maxPrice: response.data.price_range.max,
                }));
            })
            .catch((error) => console.error("Error fetching metadata:", error));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchAllJerseys(`?search=${searchQuery}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleFilterApply = () => {
        const filterQueries = [];
        if (filters.player) filterQueries.push(`player__name=${filters.player}`);
        if (filters.league) filterQueries.push(`player__team__league=${filters.league}`);
        if (filters.team) filterQueries.push(`player__team__name=${filters.team}`);
        if (filters.minPrice) filterQueries.push(`price__gte=${filters.minPrice}`);
        if (filters.maxPrice) filterQueries.push(`price__lte=${filters.maxPrice}`);
        const queryString = filterQueries.length ? `?${filterQueries.join('&')}` : '';
        fetchAllJerseys(queryString);
        setIsFilterExpanded(false);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <main className="container">
            {/* Hero Section */}
            <section className="hero">
                <h1>Football Jersey Store</h1>
                <p>Discover jerseys of your favorite teams and players.</p>
                <Recommendations />
                <button onClick={() => navigate('/customize')} className="button-primary">
                    Customize Jersey
                </button>
            </section>

            {/* Search and Filter Section */}
            <section
                style={{
                    margin: '20px 0',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '15px',
                    alignItems: 'center',
                }}
            >
                {/* Search Bar */}
                <form
                    onSubmit={handleSearchSubmit}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '10px',
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search for jerseys by player or team..."
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1rem',
                        }}
                    />
                    <button
                        type="submit"
                        className="button-primary"
                        style={{
                            padding: '12px 20px',
                            fontSize: '1rem',
                            borderRadius: '5px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Search
                    </button>
                </form>

                {/* Filter Icon */}
                <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    style={{
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '12px 20px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    Filters ⚙️
                </button>
            </section>

            {/* Collapsible Filters */}
            {isFilterExpanded && metadata && (
                <section style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <select
                        name="player"
                        value={filters.player}
                        onChange={handleFilterChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select Player</option>
                        {metadata.players.map((player) => (
                            <option key={player} value={player}>
                                {player}
                            </option>
                        ))}
                    </select>
                    <select
                        name="league"
                        value={filters.league}
                        onChange={handleFilterChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select League</option>
                        {metadata.leagues.map((league) => (
                            <option key={league} value={league}>
                                {league}
                            </option>
                        ))}
                    </select>
                    <select
                        name="team"
                        value={filters.team}
                        onChange={handleFilterChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select Team</option>
                        {metadata.teams.map((team) => (
                            <option key={team} value={team}>
                                {team}
                            </option>
                        ))}
                    </select>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Price Range: ${filters.minPrice} - ${filters.maxPrice}</label>
                        <input
                            type="range"
                            name="minPrice"
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="range"
                            name="maxPrice"
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <button onClick={handleFilterApply} className="button-primary">
                        Apply Filters
                    </button>
                </section>
            )}

            {/* Jersey Grid */}
            <div className="grid">
                {jerseys.map((jersey) => (
                    <Link key={jersey.id} to={`/jersey/${jersey.id}`} className="card">
                        <img
                            src={jersey.image}
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
