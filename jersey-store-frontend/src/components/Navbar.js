// Updated Navbar.js to ensure consistent spacing between all links with inline comments

import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Button,
    Badge,
    Container,
    Menu,
    MenuItem,
    Divider,
    Avatar,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    ShoppingCart as CartIcon,
    Edit as CustomizeIcon,
    Person as ProfileIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    LocalShipping as OrdersIcon,
    TrendingUp as SalesIcon,
} from '@mui/icons-material';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { cartItems = [] } = useContext(CartContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isAdmin = Boolean(user?.is_staff);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'black' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* Logo/Brand */}
                    <Typography
                        variant="h5"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: 'black',
                            fontWeight: 700,
                            letterSpacing: 1,
                            '&:hover': {
                                color: 'rgba(0, 0, 0, 0.7)',
                            }
                        }}
                    >
                        Jersey Store
                    </Typography>

                    {/* Navigation Links */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isAuthenticated && (
                            <>
                                <IconButton
                                    color="inherit"
                                    component={RouterLink}
                                    to="/wishlist"
                                    size="large"
                                    sx={{
                                        color: 'black',
                                        '&:hover': {
                                            color: 'rgba(0, 0, 0, 0.7)',
                                        }
                                    }}
                                >
                                    <FavoriteIcon />
                                </IconButton>

                                <IconButton
                                    color="inherit"
                                    component={RouterLink}
                                    to="/customize"
                                    size="large"
                                    sx={{
                                        color: 'black',
                                        '&:hover': {
                                            color: 'rgba(0, 0, 0, 0.7)',
                                        }
                                    }}
                                >
                                    <CustomizeIcon />
                                </IconButton>

                                <IconButton
                                    color="inherit"
                                    component={RouterLink}
                                    to="/cart"
                                    size="large"
                                    sx={{
                                        color: 'black',
                                        '&:hover': {
                                            color: 'rgba(0, 0, 0, 0.7)',
                                        }
                                    }}
                                >
                                    <Badge 
                                        badgeContent={cartItems.length} 
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.8rem',
                                                height: '20px',
                                                minWidth: '20px',
                                            }
                                        }}
                                    >
                                        <CartIcon />
                                    </Badge>
                                </IconButton>

                                <Box
                                    onClick={handleMenuClick}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        cursor: 'pointer',
                                        padding: '6px 12px',
                                        borderRadius: 1,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        }
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            backgroundColor: 'black',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            borderRadius: 1,
                                        }}
                                    >
                                        {user?.username?.[0]?.toUpperCase() || <ProfileIcon sx={{ fontSize: 18 }} />}
                                    </Avatar>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            color: 'black',
                                            display: { xs: 'none', sm: 'block' }
                                        }}
                                    >
                                        {user?.username || 'User'}
                                    </Typography>
                                    <MenuIcon 
                                        sx={{ 
                                            fontSize: 20,
                                            color: 'black',
                                            display: { xs: 'none', sm: 'block' }
                                        }} 
                                    />
                                </Box>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    keepMounted
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            mt: 1.5,
                                            minWidth: 200,
                                        }
                                    }}
                                >
                                    <MenuItem 
                                        onClick={handleMenuClose}
                                        component={RouterLink}
                                        to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                                        sx={{ gap: 1.5, color: 'black' }}
                                    >
                                        <DashboardIcon fontSize="small" />
                                        {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                                    </MenuItem>

                                    {isAdmin && (
                                        <>
                                            <MenuItem 
                                                onClick={handleMenuClose}
                                                component={RouterLink}
                                                to="/admin/orders"
                                                sx={{ gap: 1.5, color: 'black' }}
                                            >
                                                <OrdersIcon fontSize="small" />
                                                Orders
                                            </MenuItem>
                                            <MenuItem 
                                                onClick={handleMenuClose}
                                                component={RouterLink}
                                                to="/admin/sales"
                                                sx={{ gap: 1.5, color: 'black' }}
                                            >
                                                <SalesIcon fontSize="small" />
                                                Sales
                                            </MenuItem>
                                        </>
                                    )}

                                    <Divider sx={{ my: 1 }} />
                                    
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ 
                                            color: 'error.main',
                                            gap: 1.5
                                        }}
                                    >
                                        <LogoutIcon fontSize="small" />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        )}

                        {!isAuthenticated && (
                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="outlined"
                                sx={{
                                    fontWeight: 600,
                                    color: 'black',
                                    borderColor: 'black',
                                    '&:hover': {
                                        borderColor: 'black',
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    }
                                }}
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;