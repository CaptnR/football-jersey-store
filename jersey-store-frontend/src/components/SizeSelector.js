import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Dialog
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SizeSelectionDialog from './SizeSelectionDialog';

const SIZES = [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
    { value: 'XXL', label: 'Double Extra Large' },
    { value: 'XXXL', label: 'Triple Extra Large' }
];

function SizeSelector({ size, onSizeChange }) {
    const [sizeChartOpen, setSizeChartOpen] = React.useState(false);

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">Select Size</Typography>
                <IconButton 
                    size="small" 
                    onClick={() => setSizeChartOpen(true)}
                    sx={{ color: 'primary.main' }}
                >
                    <InfoIcon fontSize="small" />
                </IconButton>
            </Box>
            <FormControl fullWidth>
                <Select
                    value={size}
                    onChange={(e) => onSizeChange(e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'background.paper' }}
                >
                    {SIZES.map((sizeOption) => (
                        <MenuItem key={sizeOption.value} value={sizeOption.value}>
                            {sizeOption.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <SizeSelectionDialog
                open={sizeChartOpen}
                onClose={() => setSizeChartOpen(false)}
                onSizeSelect={(selectedSize) => {
                    onSizeChange(selectedSize);
                    setSizeChartOpen(false);
                }}
            />
        </Box>
    );
}

export default SizeSelector; 