import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    IconButton,
    Button,
    CardActions,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function JerseyCard({ jersey, onAddToCart, onAddToWishlist, isWishlisted, requiresAuth }) {
    // Add more comprehensive validation
    if (!jersey || typeof jersey !== 'object') { 
        console.warn('Invalid jersey data received:', jersey);
        return null; 
    }

    // Validate and transform data with default values
    const playerData = {
        name: jersey?.player?.name ?? 'Unknown Player',
        team: {
            name: jersey?.player?.team?.name ?? 'Unknown Team',
            league: jersey?.player?.team?.league ?? 'Unknown League'
        }
    };

    const jerseyData = {
        id: jersey?.id ?? 0,
        image: jersey?.image ?? '/placeholder.jpg',
        price: typeof jersey?.price === 'number' ? jersey.price : 0
    };

    const handleWishlistClick = () => {
        onAddToWishlist(jersey); // Pass the entire jersey object
    };

    return (
        <Card sx={{ 
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            bgcolor: 'background.paper',
            overflow: 'visible',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }
        }}>
            <Box sx={{ position: 'relative', pt: '100%' }}>
                <CardMedia
                    component="img"
                    image={jerseyData.image}
                    alt={`${playerData.name} Jersey`}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        bgcolor: '#f5f5f5',
                        p: 2
                    }}
                />
            </Box>

            <CardContent sx={{ 
                p: 2,
                pt: 1,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Link 
                    to={`/jersey/${jerseyData.id}`}
                    style={{ textDecoration: 'none' }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            fontSize: '1.25rem',
                            mb: 1
                        }}
                    >
                        {playerData.name}
                    </Typography>
                </Link>
                
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                >
                    {playerData.team.name}
                </Typography>
                
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {playerData.team.league}
                </Typography>

                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        to={`/customize/${jerseyData.id}`}
                        fullWidth
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontSize: '1rem',
                            py: 1
                        }}
                    >
                        Customize Jersey
                    </Button>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Typography
                            variant="h6"
                            sx={{ 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                color: 'primary.main',
                                fontFamily: 'Poppins, sans-serif'
                            }}
                        >
                            ${Number(jerseyData.price).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => onAddToCart(jersey)}
                            startIcon={<ShoppingCartIcon />}
                        >
                            {requiresAuth ? 'Login to Buy' : 'Add to Cart'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default JerseyCard; 