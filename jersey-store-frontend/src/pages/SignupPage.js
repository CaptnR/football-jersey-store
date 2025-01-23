import React, { useState } from 'react';
import { signupUser } from '../api/api';

function SignupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            const response = await signupUser({ username, password });
            console.log('Signup response:', response.data); // Log the response for debugging
            alert('Signup successful! You can now log in.');
        } catch (error) {
            alert('Signup failed. Username might already exist.');
        }
    };

    return (
        <main className="container">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignup} className="grid">
                <label>
                    Username
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type="submit">Sign Up</button>
            </form>
        </main>
    );
}

export default SignupPage;
