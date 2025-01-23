import React, { useState } from 'react';
import { loginUser, setAuthToken } from '../api/api';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await loginUser({ username, password });
            const token = response.data.token;
            setAuthToken(token);
            localStorage.setItem('token', token); // Save token in localStorage
            alert('Logged in successfully!');
        } catch (error) {
            alert('Login failed. Please check your credentials.');
            console.error("Error logging in:", error);
        }
    };

    return (
        <main className="container">
            <h1>Login</h1>
            <form onSubmit={handleLogin} className="grid">
                <label>
                    Username
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
        </main>
    );
}

export default LoginPage;
