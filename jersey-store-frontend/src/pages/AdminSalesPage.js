import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    Alert,
    IconButton,
    Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { adminApi } from '../api/adminApi';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';

function AdminSalesPage() {
    const [sales, setSales] = useState([]);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [error, setError] = useState(null);
    const [newSale, setNewSale] = useState({
        sale_type: 'ALL',
        target_value: '',
        discount_type: 'FLAT',
        discount_value: '',
        start_date: dayjs(),
        end_date: dayjs().add(7, 'day'),
        is_active: true
    });

    useEffect(() => {
        fetchSales();
        fetchOptions();
    }, []);

    const fetchSales = async () => {
        try {
            const response = await adminApi.get('/admin/sales/');
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setError('Failed to fetch sales');
        }
    };

    const fetchOptions = async () => {
        try {
            const [playersRes, teamsRes] = await Promise.all([
                adminApi.get('/players/'),
                adminApi.get('/teams/'),
            ]);
            
            setPlayers(playersRes.data);
            setTeams(teamsRes.data);
            
            // Extract unique leagues from teams
            const uniqueLeagues = [...new Set(teamsRes.data.map(team => team.league))];
            setLeagues(uniqueLeagues.map(league => ({ name: league })));
        } catch (error) {
            console.error('Error fetching options:', error);
            setError('Failed to fetch options');
        }
    };

    const handleCreateSale = async () => {
        try {
            await adminApi.post('/admin/sales/', newSale);
            setOpenDialog(false);
            fetchSales();
            resetForm();
        } catch (error) {
            console.error('Error creating sale:', error);
            setError('Failed to create sale');
        }
    };

    const handleEditSale = async () => {
        try {
            await adminApi.put(`/admin/sales/${editingSale.id}/`, newSale);
            setOpenDialog(false);
            fetchSales();
            resetForm();
        } catch (error) {
            console.error('Error updating sale:', error);
            setError('Failed to update sale');
        }
    };

    const handleDeleteSale = async (saleId) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await adminApi.delete(`/admin/sales/${saleId}/`);
                fetchSales();
            } catch (error) {
                console.error('Error deleting sale:', error);
                setError('Failed to delete sale');
            }
        }
    };

    const resetForm = () => {
        setNewSale({
            sale_type: 'ALL',
            target_value: '',
            discount_type: 'FLAT',
            discount_value: '',
            start_date: dayjs(),
            end_date: dayjs().add(7, 'day'),
            is_active: true
        });
        setEditingSale(null);
    };

    const handleOpenEdit = (sale) => {
        setEditingSale(sale);
        setNewSale({
            ...sale,
            start_date: dayjs(sale.start_date),
            end_date: dayjs(sale.end_date),
            target_value: sale.sale_type === 'LEAGUE' ? sale.target_value : 
                sale.target_value.split(',').map(Number).join(',')
        });
        setOpenDialog(true);
    };

    const handleToggleSale = async (saleId, newStatus) => {
        try {
            await adminApi.patch(`/admin/sales/${saleId}/`, {
                is_active: newStatus
            });
            await fetchSales();
        } catch (error) {
            console.error('Error toggling sale status:', error);
            setError('Failed to toggle sale status. Please try again.');
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        resetForm();
    };

    return (
        <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Manage Sales
                    </Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => {
                            resetForm();
                            setOpenDialog(true);
                        }}
                    >
                        Create New Sale
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {sales.map((sale) => (
                        <Grid item xs={12} md={6} lg={4} key={sale.id}>
                            <Card sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">
                                        {sale.sale_type} Sale
                                    </Typography>
                                    <Box>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleOpenEdit(sale)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDeleteSale(sale.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                {sale.sale_type !== 'ALL' && (
                                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                                        Target: {sale.target_value}
                                    </Typography>
                                )}
                                <Typography variant="h5" sx={{ mb: 2, color: 'error.main' }}>
                                    {sale.discount_type === 'FLAT' ? '₹' : ''}{sale.discount_value}{sale.discount_type === 'PERCENTAGE' ? '%' : ''} OFF
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Start: {new Date(sale.start_date).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        End: {new Date(sale.end_date).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={sale.is_active ? 'Active' : 'Inactive'}
                                    color={sale.is_active ? 'success' : 'default'}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    color={sale.is_active ? 'error' : 'success'}
                                    onClick={() => handleToggleSale(sale.id, !sale.is_active)}
                                >
                                    {sale.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog 
                    open={openDialog} 
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                    aria-labelledby="sale-dialog-title"
                    disableEnforceFocus
                    disableRestoreFocus
                >
                    <DialogTitle id="sale-dialog-title">
                        {editingSale ? 'Edit Sale' : 'Create New Sale'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Sale Type</InputLabel>
                                <Select
                                    value={newSale.sale_type}
                                    label="Sale Type"
                                    onChange={(e) => {
                                        setNewSale({
                                            ...newSale,
                                            sale_type: e.target.value,
                                            target_value: '' // Reset target value when type changes
                                        });
                                    }}
                                >
                                    <MenuItem value="ALL">All Jerseys</MenuItem>
                                    <MenuItem value="PLAYER">By Player</MenuItem>
                                    <MenuItem value="TEAM">By Team</MenuItem>
                                    <MenuItem value="LEAGUE">By League</MenuItem>
                                </Select>
                            </FormControl>

                            {newSale.sale_type === 'PLAYER' && (
                                <Autocomplete
                                    multiple
                                    options={players}
                                    getOptionLabel={(option) => option.name}
                                    value={players.filter(player => 
                                        newSale.target_value.split(',').map(Number).includes(player.id)
                                    )}
                                    onChange={(event, newValue) => {
                                        setNewSale({
                                            ...newSale,
                                            target_value: newValue.map(v => v.id).join(',')
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Players"
                                            placeholder="Select players"
                                        />
                                    )}
                                />
                            )}

                            {newSale.sale_type === 'TEAM' && (
                                <Autocomplete
                                    multiple
                                    options={teams}
                                    getOptionLabel={(option) => option.name}
                                    value={teams.filter(team => 
                                        newSale.target_value.split(',').map(Number).includes(team.id)
                                    )}
                                    onChange={(event, newValue) => {
                                        setNewSale({
                                            ...newSale,
                                            target_value: newValue.map(v => v.id).join(',')
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Teams"
                                            placeholder="Select teams"
                                        />
                                    )}
                                />
                            )}

                            {newSale.sale_type === 'LEAGUE' && (
                                <Autocomplete
                                    multiple
                                    options={leagues}
                                    getOptionLabel={(option) => option.name}
                                    value={leagues.filter(league => 
                                        newSale.target_value.split(',').includes(league.name)
                                    )}
                                    onChange={(event, newValue) => {
                                        setNewSale({
                                            ...newSale,
                                            target_value: newValue.map(v => v.name).join(',')
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Leagues"
                                            placeholder="Select leagues"
                                        />
                                    )}
                                />
                            )}

                            <FormControl fullWidth>
                                <InputLabel>Discount Type</InputLabel>
                                <Select
                                    value={newSale.discount_type}
                                    label="Discount Type"
                                    onChange={(e) => setNewSale({...newSale, discount_type: e.target.value})}
                                >
                                    <MenuItem value="FLAT">Flat Amount</MenuItem>
                                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Discount Value"
                                type="number"
                                fullWidth
                                value={newSale.discount_value}
                                onChange={(e) => setNewSale({...newSale, discount_value: e.target.value})}
                                InputProps={{
                                    startAdornment: newSale.discount_type === 'FLAT' ? '₹' : '',
                                    endAdornment: newSale.discount_type === 'PERCENTAGE' ? '%' : ''
                                }}
                            />

                            <DateTimePicker
                                label="Start Date"
                                value={dayjs(newSale.start_date)}
                                onChange={(date) => setNewSale({...newSale, start_date: date})}
                                sx={{ width: '100%' }}
                            />

                            <DateTimePicker
                                label="End Date"
                                value={dayjs(newSale.end_date)}
                                onChange={(date) => setNewSale({...newSale, end_date: date})}
                                sx={{ width: '100%' }}
                                minDate={dayjs(newSale.start_date)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={editingSale ? handleEditSale : handleCreateSale} 
                            variant="contained"
                            autoFocus
                        >
                            {editingSale ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}

export default AdminSalesPage; 