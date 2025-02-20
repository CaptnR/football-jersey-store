import React, { useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    Card,
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress
} from '@mui/material';
import { updateJerseyStock } from '../../api/api';

function StockManagement({ lowStockData, onStockUpdate }) {
    const [selectedJersey, setSelectedJersey] = useState(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [newStock, setNewStock] = useState('');
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleUpdateStock = async () => {
        setUpdating(true);
        setError('');
        try {
            await updateJerseyStock(selectedJersey.id, {
                stock: parseInt(newStock),
                low_stock_threshold: selectedJersey.low_stock_threshold
            });
            setIsUpdateDialogOpen(false);
            onStockUpdate(); // Refresh dashboard data
        } catch (err) {
            setError('Failed to update stock');
            console.error('Stock update error:', err);
        } finally {
            setUpdating(false);
        }
    };

    if (!lowStockData) return null;

    const { count, jerseys } = lowStockData;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
                Stock Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {count > 0 ? (
                <>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {count} jerseys are running low on stock!
                    </Alert>
                    <Card>
                        <List>
                            {jerseys.map((jersey) => (
                                <ListItem
                                    key={jersey.id}
                                    divider
                                    secondaryAction={
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setSelectedJersey(jersey);
                                                setNewStock(jersey.stock.toString());
                                                setIsUpdateDialogOpen(true);
                                            }}
                                        >
                                            Update Stock
                                        </Button>
                                    }
                                >
                                    <ListItemText
                                        primary={`${jersey.player__name}'s Jersey`}
                                        secondary={`Current Stock: ${jersey.stock} | Threshold: ${jersey.low_stock_threshold}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </>
            ) : (
                <Alert severity="success">
                    All jerseys are well stocked!
                </Alert>
            )}

            <Dialog 
                open={isUpdateDialogOpen} 
                onClose={() => !updating && setIsUpdateDialogOpen(false)}
            >
                <DialogTitle>Update Stock Level</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Stock Level"
                        type="number"
                        fullWidth
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        disabled={updating}
                        InputProps={{
                            inputProps: { min: 0 }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setIsUpdateDialogOpen(false)}
                        disabled={updating}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdateStock}
                        variant="contained"
                        disabled={updating || !newStock || parseInt(newStock) < 0}
                    >
                        {updating ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default StockManagement; 