import React, { useEffect, useState } from 'react';

function Filters({ onFilter, metadata }) {
    const [isExpanded, setIsExpanded] = useState(false); // State for filter expansion
    const [selectedFilters, setSelectedFilters] = useState({
        player: '',
        league: '',
        team: '',
        minPrice: metadata?.price_range?.min || 0,
        maxPrice: metadata?.price_range?.max || 100,
    });

    useEffect(() => {
        if (metadata) {
            setSelectedFilters((prevFilters) => ({
                ...prevFilters,
                minPrice: metadata.price_range.min,
                maxPrice: metadata.price_range.max,
            }));
        }
    }, [metadata]);

    const toggleFilters = () => {
        setIsExpanded(!isExpanded);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleFilterApply = () => {
        onFilter(selectedFilters); // Apply the filters
        setIsExpanded(false); // Collapse the filters
    };

    if (!metadata) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Filter Icon */}
            <button
                onClick={toggleFilters}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                }}
            >
                ⚙️ {/* Replace with a better icon if needed */}
            </button>

            {/* Expandable Filters */}
            {isExpanded && (
                <div
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        padding: '20px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }}
                >
                    {/* Player Filter */}
                    <select
                        name="player"
                        value={selectedFilters.player}
                        onChange={handleInputChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select Player</option>
                        {metadata.players.map((player) => (
                            <option key={player} value={player}>
                                {player}
                            </option>
                        ))}
                    </select>

                    {/* League Filter */}
                    <select
                        name="league"
                        value={selectedFilters.league}
                        onChange={handleInputChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select League</option>
                        {metadata.leagues.map((league) => (
                            <option key={league} value={league}>
                                {league}
                            </option>
                        ))}
                    </select>

                    {/* Team Filter */}
                    <select
                        name="team"
                        value={selectedFilters.team}
                        onChange={handleInputChange}
                        style={{
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            width: '100%',
                        }}
                    >
                        <option value="">Select Team</option>
                        {metadata.teams.map((team) => (
                            <option key={team} value={team}>
                                {team}
                            </option>
                        ))}
                    </select>

                    {/* Price Range */}
                    <div>
                        <label>Price Range:</label>
                        <input
                            type="range"
                            name="minPrice"
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            value={selectedFilters.minPrice}
                            onChange={handleInputChange}
                        />
                        <input
                            type="range"
                            name="maxPrice"
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            value={selectedFilters.maxPrice}
                            onChange={handleInputChange}
                        />
                        <p>
                            ${selectedFilters.minPrice} - ${selectedFilters.maxPrice}
                        </p>
                    </div>

                    {/* Apply Filters */}
                    <button
                        onClick={handleFilterApply}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Apply Filters
                    </button>
                </div>
            )}
        </div>
    );
}

export default Filters;
