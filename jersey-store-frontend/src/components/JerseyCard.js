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
        id: jersey.id ?? 0,
        image: jersey.image ?? '/placeholder-jersey.jpeg',
        price: typeof jersey.price === 'number' ? jersey.price : 0
    };

    const handleWishlistClick = () => {
        onAddToWishlist(jersey); // Pass the entire jersey object
    };

    return (
        <Card sx={{ 
            position: 'relative',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            bgcolor: 'background.paper',
            overflow: 'visible',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.05)'
            }
        }}>
            <IconButton
                onClick={handleWishlistClick}
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    bgcolor: 'white',
                    width: 40,
                    height: 40,
                    padding: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': { 
                        bgcolor: 'white',
                        transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s ease-in-out',
                }}
            >
                {isWishlisted ? (
                    <FavoriteIcon sx={{ color: 'red', fontSize: 20 }} />
                ) : (
                    <FavoriteBorderIcon sx={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: 20 }} />
                )}
            </IconButton>

            <CardMedia
                component="img"
                height="220"
                image={jerseyData.image}
                alt={`${playerData.name} Jersey`}
                sx={{
                    objectFit: 'contain',
                    bgcolor: '#f5f5f5',
                    p: 2
                }}
            />

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
                                fontSize: '1.25rem'
                            }}
                        >
                            ${Number(jerseyData.price).toFixed(2)}
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