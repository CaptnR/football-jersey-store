// Updated Spinner.js with Material-UI components and styling

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Spinner = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
        }}
    >
        <CircularProgress /> {/* Material-UI Spinner */}
    </Box>
);

export default Spinner;