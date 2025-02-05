// Updated Navbar.js to ensure consistent spacing between all links with inline comments

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api/api';
import { CartContext } from '../context/CartContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Badge,
    IconButton,
    //MenuItem,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function Navbar() {
    const navigate = useNavigate(); // React Router hook to programmatically navigate between routes
    const { cart } = useContext(CartContext); // Access cart context to get the number of items in the cart

    // Handle logout functionality
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token from localStorage to log out the user
        localStorage.removeItem('isAdmin'); // Clear admin status if stored
        setAuthToken(null); // Reset Axios authorization header
        alert('You have been logged out.'); // Notify the user
        navigate('/login'); // Redirect the user to the login page
    };

    // Check if the user is logged in by verifying the presence of a token
    const isLoggedIn = !!localStorage.getItem('token');
    // Check if the logged-in user is an admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return (
        <AppBar 
            position="sticky" 
            sx={{ 
                backgroundColor: 'primary.main',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <Toolbar sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.5rem 2rem'
            }}>
                <Typography
                    variant="h5"
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        '&:hover': {
                            opacity: 0.9
                        }
                    }}
                >
                    ⚽ Football Jersey Store
                </Typography>

                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center',
                    '& .MuiButton-root': {
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600
                    }
                }}>
                    {isLoggedIn && !isAdmin && ( /* Links for logged-in regular users */
                        <>
                            <Button color="inherit" component={Link} to="/dashboard"> {/* User Dashboard Link */}
                                Dashboard
                            </Button>
                            <Button color="inherit" component={Link} to="/wishlist"> {/* Wishlist Link */}
                                Wishlist
                            </Button>
                            <Button color="inherit" component={Link} to="/orders"> {/* My Orders Link */}
                                My Orders
                            </Button>
                            <IconButton color="inherit" component={Link} to="/cart"> {/* Cart Link with item count badge */}
                                <Badge badgeContent={cart.length} color="error"> {/* Show number of items in the cart */}
                                    <ShoppingCartIcon />
                                </Badge>
                            </IconButton>
                        </>
                    )}

                    {isAdmin && ( /* Links for admin users */
                        <>
                            <Button color="inherit" component={Link} to="/admin/dashboard"> {/* Admin Dashboard Link */}
                                Admin Dashboard
                            </Button>
                            <Button color="inherit" component={Link} to="/admin/orders"> {/* Admin Orders Link */}
                                Admin Orders
                            </Button>
                        </>
                    )}

                    {isLoggedIn ? ( /* Logout button for logged-in users */
                        <Button color="inherit" onClick={handleLogout}> {/* Trigger logout */}
                            Logout
                        </Button>
                    ) : ( /* Links for non-logged-in users */
                        <>
                            <Button color="inherit" component={Link} to="/login"> {/* Login Link */}
                                Login
                            </Button>
                            <Button color="inherit" component={Link} to="/signup"> {/* Signup Link */}
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;