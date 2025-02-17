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
                <Toolbar 
                    sx={{ 
                        justifyContent: 'space-between',
                        py: 1,
                    }}
                >
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'text.primary',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                        }}
                    >
                        Jersey Store
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {token && (
                            <>
                                <Button
                                    component={Link}
                                    to="/"
                                    color="inherit"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Shop
                                </Button>

                                <IconButton
                                    component={Link}
                                    to="/wishlist"
                                    color="inherit"
                                    size="large"
                                >
                                    <FavoriteIcon />
                                </IconButton>

                                <IconButton
                                    component={Link}
                                    to="/cart"
                                    color="inherit"
                                    size="large"
                                >
                                    <Badge badgeContent={cartItems?.length || 0} color="primary">
                                        <ShoppingCartIcon />
                                    </Badge>
                                </IconButton>

                                <IconButton
                                    component={Link}
                                    to="/dashboard"
                                    color="inherit"
                                    size="large"
                                >
                                    <PersonIcon />
                                </IconButton>

                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ fontWeight: 500 }}
                                >
                                    Logout
                                </Button>
                            </>
                        )}

                        {!token && (
                            <>
                                <Button
                                    component={Link}
                                    to="/login"
                                    color="inherit"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    to="/signup"
                                    color="inherit"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;