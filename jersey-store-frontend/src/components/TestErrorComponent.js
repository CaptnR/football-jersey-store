import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';

function TestErrorComponent() {
    const [shouldThrow, setShouldThrow] = useState(false);

    if (shouldThrow) {
        throw new Error('Test error');
    }

    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
                Test Error Boundary
            </Typography>
            <Button 
                variant="contained" 
                onClick={() => setShouldThrow(true)}
                color="primary"
            >
                Trigger Error
            </Button>
        </Box>
    );
}

export default TestErrorComponent; 