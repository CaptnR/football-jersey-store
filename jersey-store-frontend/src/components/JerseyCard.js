import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    IconButton,
    Button,
    CardActions,
    Rating,
    Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function JerseyCard({ jersey, onAddToCart, onAddToWishlist, onRemoveFromWishlist, isInWishlist, requiresAuth }) {
    const { addToCart } = useContext(CartContext);

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

    const handleWishlistAction = (e) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation(); // Prevent event bubbling
        if (isInWishlist) {
            onRemoveFromWishlist(jersey.id);
        } else {
            onAddToWishlist(jersey.id);
        }
    };

    return (
        <Card 
            elevation={0}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                width: '100%',
                maxWidth: 345, // Consistent card width
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                },
            }}
        >
            {/* Wishlist Button */}
            <IconButton
                onClick={handleWishlistAction}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    zIndex: 2,
                    width: 40,
                    height: 40,
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                    boxShadow: 1,
                }}
            >
                {isInWishlist ? (
                    <DeleteIcon color="error" sx={{ fontSize: 20 }} />
                ) : (
                    <FavoriteIcon 
                        sx={{ 
                            fontSize: 20,
                            color: isInWishlist ? 'error.main' : 'action.active'
                        }} 
                    />
                )}
            </IconButton>

            <Link 
                to={`/jersey/${jerseyData.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
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
                            p: 2,
                        }}
                    />
                </Box>
            </Link>

            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.1rem',
                        height: '2.4em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {playerData.name}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {playerData.team.name}
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    {playerData.team.league}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                        value={jersey.average_rating} 
                        readOnly 
                        precision={0.5}
                        size="small"
                    />
                </Box>
                <Typography 
                    variant="h6" 
                    color="primary"
                    sx={{ 
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    ${Number(jerseyData.price).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Typography>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => addToCart(jersey)}
                    fullWidth
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    {requiresAuth ? 'Login to Buy' : 'Add to Cart'}
                </Button>
            </CardActions>
        </Card>
    );
}

export default JerseyCard; 