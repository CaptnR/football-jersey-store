// Updated HomePage.js with vertical layout for search and filter elements

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Card,
    CardContent
} from '@mui/material';
import JerseyCard from '../components/JerseyCard';
import { CartContext } from '../context/CartContext';
import SearchFilterBar from '../components/SearchFilterBar';
import Spinner from '../components/Spinner';
import FilterListIcon from '@mui/icons-material/FilterList';
import LoadingOverlay from '../components/LoadingOverlay';
import CreateIcon from '@mui/icons-material/Create';
import { Link } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
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
        minRating: 0
    });
    const [metadata, setMetadata] = useState({
        leagues: [],
        teams: []
    });
    const isAuthenticated = !!localStorage.getItem('token');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

    const fetchAllJerseys = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            if (filters.league) {
                params.append('player__team__league', filters.league);
            }
            
            if (filters.team) {
                params.append('player__team__name', filters.team);
            }
            
            if (filters.minRating > 0) {
                params.append('min_rating', filters.minRating);
            }

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await API.get(`/jerseys/?${params.toString()}`);
            console.log('Fetched jerseys:', response.data); // Debug log
            setJerseys(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching jerseys:', error);
            setError('Failed to load jerseys. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterMetadata = async () => {
        try {
            const response = await API.get('/filter-metadata/');
            setMetadata(response.data);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchAllJerseys();
        fetchFilterMetadata();
        
        // Only fetch wishlist if user is authenticated
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, []); // Empty dependency array for initial load

    // Fetch when filters change
    useEffect(() => {
        fetchAllJerseys();
    }, [filters]);

    const fetchWishlist = async () => {
        try {
            const response = await API.get('/wishlist/');
            const wishlistIds = new Set(response.data.map(item => item.id));
            setWishlistedItems(wishlistIds);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFilterChange = (field) => (event) => {
        const value = event.target.value;
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRatingChange = (event, newValue) => {
        setFilters(prev => ({
            ...prev,
            minRating: newValue
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            league: '',
            team: '',
            minRating: 0
        });
    };

    const handleAddToCart = (jersey) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        addToCart(jersey);
    };

    const handleAddToWishlist = async (jerseyId) => {
        if (!isAuthenticated) {
            navigate('/login', { 
                state: { from: location.pathname }
            });
            return;
        }

        if (!jerseyId || isNaN(jerseyId)) {
            setToast({
                open: true,
                message: 'Invalid jersey ID',
                severity: 'error'
            });
            return;
        }
        
        try {
            await API.post('/wishlist/', { jersey: parseInt(jerseyId) });
            setWishlistedItems(prev => new Set([...prev, jerseyId]));
            setJerseys(prevJerseys => 
                prevJerseys.map(jersey => 
                    jersey.id === jerseyId 
                        ? { ...jersey, isInWishlist: true }
                        : jersey
                )
            );
            setToast({
                open: true,
                message: 'Added to wishlist successfully',
                severity: 'success'
            });
        } catch (error) {
            setToast({
                open: true,
                message: error.response?.data?.error || 'Failed to add to wishlist',
                severity: 'error'
            });
        }
    };

    const handleRemoveFromWishlist = async (jerseyId) => {
        try {
            console.log('Removing from wishlist with ID:', jerseyId); // Debug log
            await API.delete(`/wishlist/${jerseyId}/`);
            setWishlistedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(jerseyId);
                return newSet;
            });
            // Update the jerseys state to reflect the new wishlist status
            setJerseys(prevJerseys => 
                prevJerseys.map(jersey => 
                    jersey.id === jerseyId 
                        ? { ...jersey, isInWishlist: false }
                        : jersey
                )
            );
        } catch (error) {
            console.error('Error removing from wishlist:', error.response?.data || error.message);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                {/* Hero Section */}
                <Box 
                    sx={{ 
                        textAlign: 'center',
                        bgcolor: '#1976d2',
                        color: 'white',
                        borderRadius: '16px',
                        mt: 4,
                        p: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.95), rgba(25, 118, 210, 0.8))',
                            zIndex: 1
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                        <Typography 
                            variant="h3" 
                            component="h1"
                            sx={{ 
                                fontWeight: 700,
                                color: 'white',
                                mb: 2,
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                            }}
                        >
                            Football Jersey Store
                        </Typography>
                        <Typography 
                            variant="h6"
                            sx={{ 
                                mb: 4,
                                opacity: 0.9,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            Find authentic jerseys from your favorite teams and players
                        </Typography>

                        <Button
                            component={Link}
                            to="/customize"
                            variant="contained"
                            startIcon={<CreateIcon />}
                            sx={{
                                bgcolor: 'white',
                                color: '#1976d2',
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                },
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            Create Custom Jersey
                        </Button>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box sx={{ mt: 6, mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search jerseys"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                    />
                </Box>

                {/* Filters Button */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        sx={{ 
                            color: 'text.secondary',
                            borderColor: 'divider'
                        }}
                        variant="outlined"
                    >
                        Filters
                    </Button>
                </Box>

                {/* Filter Panel */}
                {isFilterExpanded && (
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Grid container spacing={3} alignItems="center">
                                {/* League Filter */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>League</InputLabel>
                                        <Select
                                            value={filters.league}
                                            onChange={handleFilterChange('league')}
                                            label="League"
                                        >
                                            <MenuItem value="">All Leagues</MenuItem>
                                            {metadata.leagues.map((league) => (
                                                <MenuItem key={league} value={league}>
                                                    {league}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Team Filter */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Team</InputLabel>
                                        <Select
                                            value={filters.team}
                                            onChange={handleFilterChange('team')}
                                            label="Team"
                                        >
                                            <MenuItem value="">All Teams</MenuItem>
                                            {metadata.teams.map((team) => (
                                                <MenuItem key={team} value={team}>
                                                    {team}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Rating Filter */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography gutterBottom>
                                        Minimum Rating: {filters.minRating}
                                    </Typography>
                                    <Slider
                                        value={filters.minRating}
                                        onChange={handleRatingChange}
                                        min={0}
                                        max={5}
                                        step={0.5}
                                        marks
                                        valueLabelDisplay="auto"
                                    />
                                </Grid>

                                {/* Reset Button */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleResetFilters}
                                        fullWidth
                                    >
                                        Reset Filters
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Jersey Grid */}
                <LoadingOverlay loading={loading}>
                    {error ? (
                        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                    ) : jerseys.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>No jerseys found</Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {jerseys.map((jersey) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={jersey.id}>
                                    <JerseyCard
                                        jersey={jersey}
                                        onAddToCart={handleAddToCart}
                                        onAddToWishlist={handleAddToWishlist}
                                        onRemoveFromWishlist={handleRemoveFromWishlist}
                                        isInWishlist={wishlistedItems.has(jersey.id)}
                                        requiresAuth={!isAuthenticated}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </LoadingOverlay>
            </Container>
        </Box>
    );
}

export default HomePage;
