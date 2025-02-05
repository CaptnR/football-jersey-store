// Updated HomePage.js with vertical layout for search and filter elements

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, fetchJerseys } from '../api/api';
import Recommendations from '../components/Recommendations';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Select,
    MenuItem,
    Slider,
    CircularProgress,
} from '@mui/material';

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
                console.error('Error fetching jerseys:', error);
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
            .catch((error) => console.error('Error fetching metadata:', error));
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

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

    return (
        <Container maxWidth="lg">
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h2" color="primary" gutterBottom>
                    Football Jersey Store
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Discover jerseys of your favorite teams and players.
                </Typography>
                <Recommendations />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/customize')}
                    sx={{ mt: 2 }}
                >
                    Customize Jersey
                </Button>
            </Box>

            {/* Search and Filter Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <form onSubmit={handleSearchSubmit} style={{ width: '100%', textAlign: 'center', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search for jerseys by player or team..."
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{ padding: '8px', width: '80%', marginBottom: '8px' }}
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Search
                    </Button>
                </form>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    sx={{ mt: 2 }}
                >
                    Filters ⚙️
                </Button>
            </Box>

            {/* Collapsible Filters */}
            {isFilterExpanded && metadata && (
                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', mb: 4 }}>
                    <Select
                        name="player"
                        value={filters.player}
                        onChange={handleFilterChange}
                        displayEmpty
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select Player</MenuItem>
                        {metadata.players.map((player) => (
                            <MenuItem key={player} value={player}>
                                {player}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        name="league"
                        value={filters.league}
                        onChange={handleFilterChange}
                        displayEmpty
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select League</MenuItem>
                        {metadata.leagues.map((league) => (
                            <MenuItem key={league} value={league}>
                                {league}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        name="team"
                        value={filters.team}
                        onChange={handleFilterChange}
                        displayEmpty
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select Team</MenuItem>
                        {metadata.teams.map((team) => (
                            <MenuItem key={team} value={team}>
                                {team}
                            </MenuItem>
                        ))}
                    </Select>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Price Range: ${filters.minPrice} - ${filters.maxPrice}
                    </Typography>
                    <Slider
                        name="price"
                        value={[filters.minPrice, filters.maxPrice]}
                        onChange={(e, newValue) => {
                            setFilters({ ...filters, minPrice: newValue[0], maxPrice: newValue[1] });
                        }}
                        min={metadata.price_range.min}
                        max={metadata.price_range.max}
                        valueLabelDisplay="auto"
                    />
                    <Button variant="contained" color="primary" onClick={handleFilterApply} sx={{ mt: 2 }}>
                        Apply Filters
                    </Button>
                </Box>
            )}

            {/* Jersey Grid */}
            <Grid container spacing={4}>
                {jerseys.map((jersey) => (
                    <Grid item xs={12} sm={6} md={4} key={jersey.id}>
                        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={jersey.image}
                                alt="Jersey"
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    ${jersey.price}
                                </Typography>
                                <Button
                                    component={Link}
                                    to={`/jersey/${jersey.id}`}
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default HomePage;
