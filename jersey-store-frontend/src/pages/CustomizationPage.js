import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { saveCustomization } from '../api/api';

function CustomizationPage() {
    const location = useLocation();
    const jerseyId = location.state?.jerseyId;
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [design, setDesign] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!jerseyId) {
            alert("Jersey ID is missing. Please try again.");
            return;
        }

        const requestData = { name, number, design, jersey: jerseyId };

        try {
            await saveCustomization(requestData);
            alert("Your customization has been saved!");
        } catch (error) {
            console.error("Error saving customization:", error);
            alert("Failed to save customization. Please try again.");
        }
    };

    return (
        <main className="container">
            <h1>Customize Your Jersey</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                    Name
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Number
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Design
                    <textarea
                        value={design}
                        onChange={(e) => setDesign(e.target.value)}
                        required
                    ></textarea>
                </label>
                <button className="button-primary" type="submit">
                    Submit
                </button>
            </form>
        </main>
    );
}

export default CustomizationPage;
