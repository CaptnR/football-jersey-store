// Updated SearchFilterBar.js with Material-UI components and styling

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Button,
    //Typography,
} from '@mui/material';

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
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                mb: 4,
                alignItems: 'center',
            }}
        >
            <TextField
                label="Search by player or team"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1 }}
            />
            <Select
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                displayEmpty
                sx={{ minWidth: 150 }}
            >
                <MenuItem value="">Select League</MenuItem>
                <MenuItem value="Premier League">Premier League</MenuItem>
                <MenuItem value="La Liga">La Liga</MenuItem>
                <MenuItem value="Serie A">Serie A</MenuItem>
            </Select>
            <Select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                displayEmpty
                sx={{ minWidth: 150 }}
            >
                <MenuItem value="">Select Team</MenuItem>
                <MenuItem value="1">Team 1</MenuItem>
                <MenuItem value="2">Team 2</MenuItem>
                <MenuItem value="3">Team 3</MenuItem>
            </Select>
            <TextField
                label="Min Price"
                type="number"
                variant="outlined"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                sx={{ width: 120 }}
            />
            <TextField
                label="Max Price"
                type="number"
                variant="outlined"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                sx={{ width: 120 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{ whiteSpace: 'nowrap' }}
            >
                Search
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleFilter}
                sx={{ whiteSpace: 'nowrap' }}
            >
                Filter
            </Button>
        </Box>
    );
}

export default SearchFilterBar;