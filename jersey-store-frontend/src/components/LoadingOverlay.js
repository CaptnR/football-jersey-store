import React from 'react';
import { Box, CircularProgress } from '@mui/material';

function LoadingOverlay({ loading, children }) {
    return (
        <Box position="relative">
            {loading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255, 255, 255, 0.8)"
                    zIndex={1000}
                >
                    <CircularProgress />
                </Box>
            )}
            {children}
        </Box>
    );
}

export default LoadingOverlay; 