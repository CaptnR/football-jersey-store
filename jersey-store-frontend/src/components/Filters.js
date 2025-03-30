// Updated Filters.js with Material-UI components and styling

import React, { useEffect, useState } from 'react';
import {
    Box,
    Select,
    MenuItem,
    Slider,
    Button,
    IconButton,
    Typography,
    Popover,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

function Filters({ onFilter, metadata }) {
    const [anchorEl, setAnchorEl] = useState(null);
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

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleFilterApply = () => {
        onFilter(selectedFilters);
        handleClose();
    };

    const open = Boolean(anchorEl);

    if (!metadata) return null;

    return (
        <Box>
            {/* Filter Icon */}
            <IconButton onClick={handleOpen} color="primary">
                <FilterListIcon />
            </IconButton>

            {/* Expandable Filters */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, width: 300 }}>
                    <Typography variant="h6" gutterBottom>
                        Filters
                    </Typography>

                    {/* Player Filter */}
                    <Select
                        name="player"
                        value={selectedFilters.player}
                        onChange={handleInputChange}
                        fullWidth
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select Player</MenuItem>
                        {metadata.players.map((player) => (
                            <MenuItem key={player} value={player}>
                                {player}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* League Filter */}
                    <Select
                        name="league"
                        value={selectedFilters.league}
                        onChange={handleInputChange}
                        fullWidth
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select League</MenuItem>
                        {metadata.leagues.map((league) => (
                            <MenuItem key={league} value={league}>
                                {league}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Team Filter */}
                    <Select
                        name="team"
                        value={selectedFilters.team}
                        onChange={handleInputChange}
                        fullWidth
                        displayEmpty
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="">Select Team</MenuItem>
                        {metadata.teams.map((team) => (
                            <MenuItem key={team} value={team}>
                                {team}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Price Range */}
                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            Price Range: ₹{selectedFilters.minPrice} - ₹{selectedFilters.maxPrice}
                        </Typography>
                        <Slider
                            name="minPrice"
                            value={selectedFilters.minPrice}
                            onChange={(e, newValue) =>
                                setSelectedFilters((prev) => ({ ...prev, minPrice: newValue }))
                            }
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            valueLabelDisplay="auto"
                        />
                        <Slider
                            name="maxPrice"
                            value={selectedFilters.maxPrice}
                            onChange={(e, newValue) =>
                                setSelectedFilters((prev) => ({ ...prev, maxPrice: newValue }))
                            }
                            min={metadata.price_range.min}
                            max={metadata.price_range.max}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    {/* Apply Filters */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleFilterApply}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Popover>
        </Box>
    );
}

export default Filters;