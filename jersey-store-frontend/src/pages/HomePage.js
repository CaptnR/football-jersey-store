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
    Card
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
        priceRange: [0, 1000],
    });
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

    // Add useEffect to watch for search and filter changes
    useEffect(() => {
        fetchAllJerseys();
    }, [searchQuery, filters, isAuthenticated]);

    const fetchAllJerseys = async () => {
        try {
            setLoading(true);
            const [jerseysResponse, wishlistResponse] = await Promise.all([
                API.get('/jerseys/', {
                    params: {
                        search: searchQuery,
                        min_price: filters.priceRange[0],
                        max_price: filters.priceRange[1],
                        league: filters.league,
                        team: filters.team
                    }
                }),
                isAuthenticated ? API.get('/wishlist/') : Promise.resolve({ data: [] })
            ]);

            // Create a Set of wishlisted jersey IDs
            const wishlistedIds = new Set(wishlistResponse.data.map(item => item.id));
            
            // Add isInWishlist property to each jersey
            const jerseysWithWishlist = jerseysResponse.data.map(jersey => ({
                ...jersey,
                isInWishlist: wishlistedIds.has(jersey.id)
            }));

            setJerseys(jerseysWithWishlist);
            setWishlistedItems(wishlistedIds);
        } catch (error) {
            console.error('Error fetching jerseys:', error.response?.data || error.message);
            setError('Failed to load jerseys. Please try again later.');
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

                {/* Jersey Grid */}
                <LoadingOverlay loading={loading}>
                    <Grid container spacing={3}>
                        {jerseys.map((jersey) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={jersey.id}>
                                <JerseyCard
                                    jersey={jersey}
                                    onAddToCart={handleAddToCart}
                                    onAddToWishlist={handleAddToWishlist}
                                    onRemoveFromWishlist={handleRemoveFromWishlist}
                                    isInWishlist={jersey.isInWishlist}
                                    requiresAuth={!isAuthenticated}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </LoadingOverlay>
            </Container>
        </Box>
    );
}

export default HomePage;
