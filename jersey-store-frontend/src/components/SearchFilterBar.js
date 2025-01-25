import React, { useState } from 'react';

function SearchFilterBar({ onSearch, onFilter }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [league, setLeague] = useState('');
    const [team, setTeam] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    const handleFilter = () => {
        onFilter({ league, team, minPrice, maxPrice });
    };

    return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
                type="text"
                placeholder="Search by player or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={league} onChange={(e) => setLeague(e.target.value)}>
                <option value="">Select League</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Serie A">Serie A</option>
            </select>
            <select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">Select Team</option>
                <option value="1">Team 1</option>
                <option value="2">Team 2</option>
                <option value="3">Team 3</option>
            </select>
            <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleFilter}>Filter</button>
        </div>
    );
}

export default SearchFilterBar;
