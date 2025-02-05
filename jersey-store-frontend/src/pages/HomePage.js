// Updated HomePage.js with vertical layout for search and filter elements

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJerseys, addToWishlist, removeFromWishlist } from '../api/api';
import { API } from '../api/api';
import {
    Container,
    Box,
    Typography,
    Grid,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Button,
    IconButton,
    Card
} from '@mui/material';
import JerseyCard from '../components/JerseyCard';
import { CartContext } from '../context/CartContext';
import SearchFilterBar from '../components/SearchFilterBar';
import Spinner from '../components/Spinner';
import FilterListIcon from '@mui/icons-material/FilterList';

function HomePage() {
    const navigate = useNavigate();
    const [jerseys, setJerseys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wishlistedItems, setWishlistedItems] = useState(new Set());
    const { addToCart } = useContext(CartContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);
    const [filters, setFilters] = useState({
        league: '',
        team: '',
        priceRange: [0, 1000],
    });
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');

    // Add useEffect to watch for search and filter changes
    useEffect(() => {
        fetchAllJerseys();
    }, [searchQuery, filters]);

    const fetchAllJerseys = async () => {
        try {
            setLoading(true);
            let url = '/jerseys/?';
            
            // Add search query if present
            if (searchQuery.trim()) {
                url += `search=${encodeURIComponent(searchQuery.trim())}&`;
            }
            
            // Add filters
            if (filters.league) {
                url += `player__team__league=${encodeURIComponent(filters.league)}&`;
            }
            if (filters.team) {
                url += `player__team__name=${encodeURIComponent(filters.team)}&`;
            }
            if (filters.priceRange && Array.isArray(filters.priceRange)) {
                url += `min_price=${filters.priceRange[0]}&max_price=${filters.priceRange[1]}&`;
            }
            
            console.log('Fetching jerseys with URL:', url); // Debug log
            const response = await API.get(url);
            setJerseys(response.data);
        } catch (error) {
            console.error('Error fetching jerseys:', error);
            setError('Failed to load jerseys');
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await API.get('/wishlist/');
            const wishlistIds = new Set(response.data.map(item => item.id));
            setWishlistedItems(wishlistIds);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    useEffect(() => {
        fetchAllJerseys();
        fetchFilterMetadata();
        
        // Only fetch wishlist if user is authenticated
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, []);

    const fetchFilterMetadata = async () => {
        try {
            const response = await API.get('/metadata/');
            setLeagues(response.data.leagues);
            setTeams(response.data.teams);
            setMetadata(response.data);
            setFilters((prevFilters) => ({
                ...prevFilters,
                minPrice: response.data.price_range.min,
                maxPrice: response.data.price_range.max,
            }));
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddToCart = (jersey) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToCart(jersey);
    };

    const handleWishlist = async (jersey) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        try {
            if (wishlistedItems.has(jersey.id)) {
                console.log('Removing jersey ID:', jersey.id);
                const response = await removeFromWishlist(jersey.id);
                
                if (response.status === 204) {
                    setWishlistedItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(jersey.id);
                        return newSet;
                    });
                }
            } else {
                await addToWishlist(jersey.id);
                setWishlistedItems(prev => new Set([...prev, jersey.id]));
            }
        } catch (error) {
            console.error('Wishlist operation failed:', error.response?.data);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pt: 4, pb: 8 }}>
            <Container maxWidth="xl">
                {/* Hero Section */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Football Jersey Store
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
                    >
                        Find authentic jerseys from your favorite teams and players
                    </Typography>
                    
                    {!isAuthenticated && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 2 }}
                        >
                            Login to Shop
                        </Button>
                    )}
                </Box>

                {/* Search and Filter */}
                <Box sx={{ mb: 6 }}>
                    <TextField
                        fullWidth
                        label="Search jerseys"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ mb: 2 }}
                    />
                    
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        sx={{ mb: 2 }}
                    >
                        Filters
                    </Button>

                    {isFilterExpanded && (
                        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>League</InputLabel>
                                        <Select
                                            value={filters.league}
                                            onChange={(e) => handleFilterChange('league', e.target.value)}
                                        >
                                            <MenuItem value="">All Leagues</MenuItem>
                                            {leagues.map(league => (
                                                <MenuItem key={league} value={league}>{league}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Team</InputLabel>
                                        <Select
                                            value={filters.team}
                                            onChange={(e) => handleFilterChange('team', e.target.value)}
                                        >
                                            <MenuItem value="">All Teams</MenuItem>
                                            {teams.map(team => (
                                                <MenuItem key={team} value={team}>{team}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography gutterBottom>Price Range</Typography>
                                    <Slider
                                        value={filters.priceRange}
                                        onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={1000}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>

                {/* Loading and Error States */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <Spinner />
                    </Box>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {/* Jersey Grid */}
                {!loading && !error && (
                    <>
                        {jerseys.length > 0 ? (
                            <Grid 
                                container 
                                spacing={2}
                                sx={{
                                    px: 2,
                                    '& .MuiGrid-item': {
                                        display: 'flex',
                                        width: '20%'
                                    }
                                }}
                            >
                                {jerseys.map((jersey) => (
                                    <Grid item xs={12} sm={6} md={2.4} key={jersey.id}>
                                        <JerseyCard
                                            jersey={jersey}
                                            onAddToCart={handleAddToCart}
                                            onAddToWishlist={handleWishlist}
                                            isWishlisted={wishlistedItems.has(jersey.id)}
                                            requiresAuth={!isAuthenticated}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box 
                                sx={{ 
                                    textAlign: 'center',
                                    py: 8,
                                    color: 'text.secondary'
                                }}
                            >
                                <Typography variant="h6">
                                    No jerseys found
                                </Typography>
                                <Typography variant="body1">
                                    Try adjusting your search or filters
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}

export default HomePage;
