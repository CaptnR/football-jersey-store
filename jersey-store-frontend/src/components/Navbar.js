import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api/api';

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from storage
        setAuthToken(null); // Clear Axios authorization header
        alert('You have been logged out.');
        navigate('/login'); // Redirect to login page
    };

    const isLoggedIn = !!localStorage.getItem('token'); // Check if user is logged in

    return (
        <nav className="container-fluid" role="navigation" style={{ padding: '1rem 0', borderBottom: '1px solid #ddd' }}>
            <ul>
                <li>
                    <strong>Football Jersey Store</strong>
                </li>
            </ul>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {isLoggedIn ? (
                    <>
                        <li>
                            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
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
