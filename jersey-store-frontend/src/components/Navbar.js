import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api/api';
import { CartContext } from '../context/CartContext'; // Import CartContext

function Navbar() {
    const navigate = useNavigate();
    const { cart } = useContext(CartContext); // Access cart context to get cart items

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from storage
        localStorage.removeItem('isAdmin'); // Remove admin status if stored
        setAuthToken(null); // Clear Axios authorization header
        alert('You have been logged out.');
        navigate('/login'); // Redirect to login page
    };

    const isLoggedIn = !!localStorage.getItem('token'); // Check if user is logged in
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Check if user is an admin

    return (
        <nav className="container-fluid" role="navigation" style={{ padding: '1rem 0', borderBottom: '1px solid #ddd' }}>
            <ul>
                <li>
                    <strong>Football Jersey Store</strong>
                </li>
            </ul>
            <ul style={{ display: 'flex', gap: '10px' }}>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {isLoggedIn && (
                    <>
                        <li>
                            <Link to="/dashboard">Dashboard</Link> {/* New User Dashboard Link */}
                        </li>
                        <li>
                            <Link to="/wishlist">Wishlist</Link> {/* Wishlist link */}
                        </li>
                        <li>
                            <Link to="/cart">
                                Cart ({cart.length}) {/* Display the number of items in the cart */}
                            </Link>
                        </li>
                        <li>
                            <Link to="/orders">My Orders</Link> {/* User orders link */}
                        </li>
                        {isAdmin && (
                            <>
                                <li>
                                    <Link to="/admin/dashboard">Admin Dashboard</Link> {/* Admin dashboard link */}
                                </li>
                                <li>
                                    <Link to="/admin/orders">Admin Orders</Link> {/* Admin orders link */}
                                </li>
                            </>
                        )}
                        <li>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                }}
                            >
                                Logout
                            </button>
                        </li>
                    </>
                )}
                {!isLoggedIn && (
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/signup">Sign Up</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
