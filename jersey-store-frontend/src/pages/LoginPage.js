import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password,
            });

            const token = response.data.token; // Extract token from the response
            const isAdmin = response.data.is_admin; // Extract admin status from the response

            // Save the token and admin status in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('isAdmin', isAdmin); // Store admin status as 'true' or 'false'

            alert('Login successful!');
            navigate('/'); // Redirect to the home page
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
