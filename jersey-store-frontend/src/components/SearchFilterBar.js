// Updated SearchFilterBar.js with Material-UI components and styling

import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Slider,
    InputAdornment,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

function SearchFilterBar({ 
    onSearch, 
    onFilter,
    leagues = [],
    teams = [],
    priceRange = { min: 0, max: 200 }
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        league: '',
        team: '',
        priceRange: [priceRange.min, priceRange.max]
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleFilterApply = () => {
        onFilter(filters);
        setFilterOpen(false);
    };

    const handleReset = () => {
        setFilters({
            league: '',
            team: '',
            priceRange: [priceRange.min, priceRange.max]
        });
    };

    const handleFilterChange = (field, value) => {
        if (value === null) return;
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePriceChange = (event, newValue) => {
        if (!Array.isArray(newValue)) return;
        setFilters(prev => ({
            ...prev,
            priceRange: newValue
        }));
    };

    return (
        <>
            <Box 
                component="form" 
                onSubmit={handleSearch}
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    mb: 4,
                    p: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Search jerseys"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                sx: {
                                    borderRadius: 2,
                                    backgroundColor: 'white',
                                }
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>League</InputLabel>
                                <Select
                                    value={filters.league}
                                    onChange={(e) => handleFilterChange('league', e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <MenuItem value="">All Leagues</MenuItem>
                                    {leagues.map(league => (
                                        <MenuItem key={league} value={league}>{league}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Team</InputLabel>
                                <Select
                                    value={filters.team}
                                    onChange={(e) => handleFilterChange('team', e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <MenuItem value="">All Teams</MenuItem>
                                    {teams.map(team => (
                                        <MenuItem key={team} value={team}>{team}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Filter Dialog */}
            <Dialog 
                open={filterOpen} 
                onClose={() => setFilterOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1
                }}>
                    Filters
                    <IconButton onClick={() => setFilterOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>League</InputLabel>
                            <Select
                                value={filters.league}
                                label="League"
                                onChange={(e) => setFilters({...filters, league: e.target.value})}
                            >
                                <MenuItem value="">All Leagues</MenuItem>
                                {leagues.map(league => (
                                    <MenuItem key={league} value={league}>{league}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Team</InputLabel>
                            <Select
                                value={filters.team}
                                label="Team"
                                onChange={(e) => setFilters({...filters, team: e.target.value})}
                            >
                                <MenuItem value="">All Teams</MenuItem>
                                {teams.map(team => (
                                    <MenuItem key={team} value={team}>{team}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <InputLabel>Price Range</InputLabel>
                            <Slider
                                value={filters.priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={priceRange.min}
                                max={priceRange.max}
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleReset} variant="outlined">
                        Reset
                    </Button>
                    <Button onClick={handleFilterApply} variant="contained">
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SearchFilterBar;