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
} from '@mui/material';
import JerseyCard from '../components/JerseyCard';
import { CartContext } from '../context/CartContext';
import SearchFilterBar from '../components/SearchFilterBar';
import Spinner from '../components/Spinner';

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
        player: '',
        league: '',
        team: '',
        minPrice: 0,
        maxPrice: 100,
    });
    const [metadata, setMetadata] = useState(null);

    const fetchAllJerseys = async (query = '') => {
        try {
            setLoading(true);
            const response = await fetchJerseys(query);
            setJerseys(response.data);
        } catch (error) {
            console.error('Error fetching jerseys:', error);
            setError('Failed to load jerseys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllJerseys();
        fetchFilterMetadata();
    }, [navigate]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await API.get('/wishlist/');
                const wishlistIds = new Set(response.data.map(item => item.id));
                setWishlistedItems(wishlistIds);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            }
        };

        if (localStorage.getItem('token')) {
            fetchWishlist();
        }
    }, []);

    const fetchFilterMetadata = () => {
        API.get('/metadata/')
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

    const handleSearch = (query) => {
        fetchAllJerseys(`?search=${query}`);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleFilterApply = (filters) => {
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

    const handleWishlist = async (jersey) => {
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
                </Box>

                {/* Search and Filter */}
                <Box sx={{ mb: 6 }}>
                    <SearchFilterBar 
                        onSearch={handleSearch}
                        onFilter={handleFilterApply}
                        leagues={metadata?.leagues || []}
                        teams={metadata?.teams || []}
                        priceRange={{
                            min: metadata?.price_range?.min || 0,
                            max: metadata?.price_range?.max || 200
                        }}
                    />
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
                                            onAddToCart={() => addToCart(jersey)}
                                            onAddToWishlist={handleWishlist}
                                            isWishlisted={wishlistedItems.has(jersey.id)}
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
