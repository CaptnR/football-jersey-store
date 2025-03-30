import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Box
} from '@mui/material';

const sizeChartData = {
    'US Standard': [
        { size: 'XS', chest: '32-34', length: '26', shoulder: '17' },
        { size: 'S', chest: '35-37', length: '27', shoulder: '18' },
        { size: 'M', chest: '38-40', length: '28', shoulder: '19' },
        { size: 'L', chest: '41-43', length: '29', shoulder: '20' },
        { size: 'XL', chest: '44-46', length: '30', shoulder: '21' },
        { size: 'XXL', chest: '47-49', length: '31', shoulder: '22' },
        { size: 'XXXL', chest: '50-52', length: '32', shoulder: '23' }
    ],
    'EU Standard': [
        { size: 'XS', chest: '82-86', length: '66', shoulder: '43' },
        { size: 'S', chest: '89-94', length: '69', shoulder: '46' },
        { size: 'M', chest: '97-102', length: '71', shoulder: '48' },
        { size: 'L', chest: '104-109', length: '74', shoulder: '51' },
        { size: 'XL', chest: '112-117', length: '76', shoulder: '53' },
        { size: 'XXL', chest: '119-124', length: '79', shoulder: '56' },
        { size: 'XXXL', chest: '127-132', length: '81', shoulder: '58' }
    ]
};

function SizeSelectionDialog({ open, onClose, onSizeSelect }) {
    const [selectedSize, setSelectedSize] = useState('M');
    const [sizeStandard, setSizeStandard] = useState('US Standard');

    const handleSizeChange = (event) => {
        setSelectedSize(event.target.value);
    };

    const handleConfirm = () => {
        onSizeSelect(selectedSize);
        onClose();
    };

    const handleStandardChange = (event, newValue) => {
        setSizeStandard(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Jersey Size</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <FormControl component="fieldset">
                        <RadioGroup row value={selectedSize} onChange={handleSizeChange}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                                <FormControlLabel
                                    key={size}
                                    value={size}
                                    control={<Radio />}
                                    label={size}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Box>

                <Typography variant="h6" gutterBottom>Size Chart</Typography>
                <Tabs value={sizeStandard} onChange={handleStandardChange} sx={{ mb: 2 }}>
                    <Tab label="US Standard" value="US Standard" />
                    <Tab label="EU Standard" value="EU Standard" />
                </Tabs>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Size</TableCell>
                                <TableCell>Chest (inches/cm)</TableCell>
                                <TableCell>Length (inches/cm)</TableCell>
                                <TableCell>Shoulder (inches/cm)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sizeChartData[sizeStandard].map((row) => (
                                <TableRow 
                                    key={row.size}
                                    sx={{ 
                                        backgroundColor: selectedSize === row.size ? 'action.selected' : 'inherit'
                                    }}
                                >
                                    <TableCell>{row.size}</TableCell>
                                    <TableCell>{row.chest}</TableCell>
                                    <TableCell>{row.length}</TableCell>
                                    <TableCell>{row.shoulder}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirm Size
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SizeSelectionDialog; 