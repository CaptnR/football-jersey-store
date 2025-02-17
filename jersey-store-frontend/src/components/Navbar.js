// Updated Navbar.js to ensure consistent spacing between all links with inline comments

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Button,
    Badge,
    Container,
} from '@mui/material';
import { CartContext } from '../context/CartContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import CreateIcon from '@mui/icons-material/Create';

function Navbar() {
    const { cartItems = [] } = useContext(CartContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    return (
        <AppBar 
            position="sticky" 
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                    {/* Logo/Brand */}
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'text.primary',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                        }}
                    >
                        Jersey Store
                    </Typography>

                    {/* Navigation Items */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            component={Link}
                            to="/"
                            sx={{ 
                                color: 'text.primary',
                                fontWeight: 500 
                            }}
                        >
                            Shop
                        </Button>

                        <IconButton
                            component={Link}
                            to="/wishlist"
                            sx={{ color: 'text.primary' }}
                        >
                            <FavoriteIcon />
                        </IconButton>

                        <IconButton
                            component={Link}
                            to="/customize"
                            sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            <CreateIcon />
                        </IconButton>

                        <IconButton
                            component={Link}
                            to="/cart"
                            sx={{ color: 'text.primary' }}
                        >
                            <Badge badgeContent={cartItems?.length || 0} color="primary">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>

                        <IconButton
                            component={Link}
                            to="/dashboard"
                            sx={{ color: 'text.primary' }}
                        >
                            <PersonIcon />
                        </IconButton>

                        <Button
                            onClick={handleLogout}
                            sx={{ 
                                color: 'text.primary',
                                fontWeight: 500 
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;