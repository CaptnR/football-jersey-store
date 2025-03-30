import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { CURRENCY } from '../utils/constants';
import SizeSelectionDialog from './SizeSelectionDialog';

function JerseyCard({ jersey, onAddToCart, onAddToWishlist, onRemoveFromWishlist, isInWishlist, requiresAuth }) {
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = jersey?.images || [];

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

    const handleWishlistAction = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!jersey?.id) {
            console.error('Invalid jersey ID:', jersey);
            return;
        }

        try {
            if (requiresAuth) {
                navigate('/login');
                return;
            }

            if (isInWishlist) {
                await onRemoveFromWishlist(jersey.id);
            } else {
                await onAddToWishlist(jersey.id);
            }
        } catch (error) {
            console.error('Wishlist action failed:', error.response?.data || error.message);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (requiresAuth) {
            navigate('/login');
            return;
        }
        setSizeDialogOpen(true);
    };

    const handleSizeSelect = (size) => {
        addToCart({ ...jersey, size });
    };

    const handlePrevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const getDisplayImage = () => {
        if (images && images.length > 0) {
            return images[currentImageIndex].image;
        }
        return '/placeholder.jpg'; // Add a placeholder image to your public folder
    };

    return (
        <>
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
                    maxWidth: 345,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                    },
                }}
            >
                {jersey.on_sale && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 20,
                            left: -35,
                            transform: 'rotate(-45deg)',
                            backgroundColor: 'error.main',
                            color: 'white',
                            px: 4,
                            py: 0.5,
                            zIndex: 1,
                            width: '140px',
                            textAlign: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                    >
                        SALE
                    </Box>
                )}
                <IconButton
                    onClick={handleWishlistAction}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 3,
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
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                        <CardMedia
                            component="img"
                            image={getDisplayImage()}
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
                        {images.length > 1 && (
                            <>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                                        zIndex: 2,
                                    }}
                                >
                                    <IconButton
                                        onClick={handlePrevImage}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            },
                                        }}
                                    >
                                        <ArrowBackIosNewIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(to left, rgba(255,255,255,0.8), rgba(255,255,255,0))',
                                        zIndex: 2,
                                    }}
                                >
                                    <IconButton
                                        onClick={handleNextImage}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            },
                                        }}
                                    >
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </>
                        )}
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
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {jersey.on_sale ? (
                                <>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ textDecoration: 'line-through' }}
                                    >
                                        ₹{jersey.price}
                                    </Typography>
                                    <Typography variant="h6" color="error.main">
                                        ₹{jersey.sale_price}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="h6">
                                    ₹{jersey.price}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={handleAddToCart}
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

            <SizeSelectionDialog
                open={sizeDialogOpen}
                onClose={() => setSizeDialogOpen(false)}
                onSizeSelect={handleSizeSelect}
            />
        </>
    );
}

export default JerseyCard; 