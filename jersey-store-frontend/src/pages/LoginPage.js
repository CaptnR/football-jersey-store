import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password,
            });

            const token = response.data.token; // Extract token from API response
            localStorage.setItem('token', token); // Save token in localStorage
            console.log('Token saved:', token); // Debug: Check the saved token
            alert('Login successful!');
            navigate('/'); // Navigate to the home page
        } catch (error) {
            console.error('Error during login:', error.response || error.message);
            alert('Login failed. Please try again.');
        }
    };

    return (
        <main className="container">
            <h1>Login</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                    Username:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" className="button-primary">Login</button>
            </form>
        </main>
    );
}

export default LoginPage;
