// Updated Footer.js with Material-UI components and styling

import React from 'react';
import { Box, Typography, Link } from '@mui/material';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                textAlign: 'center',
                py: 2,
                mt: 4,
            }}
        >
            <Typography variant="body2">
                © 2025 Football Jersey Store •{' '}
                <Link href="/privacy-policy" color="inherit" underline="hover">
                    Privacy Policy
                </Link>
            </Typography>
        </Box>
    );
}

export default Footer;