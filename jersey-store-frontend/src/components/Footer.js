// Updated Footer.js with Material-UI components and styling

import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                py: 6,
                mt: 'auto'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Football Jersey Store
                        </Typography>
                        <Typography variant="body2">
                            Your one-stop shop for authentic football jerseys from around the world.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Quick Links
                        </Typography>
                        <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
                            About Us
                        </Link>
                        <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
                            Contact
                        </Link>
                        <Link href="/faq" color="inherit" display="block">
                            FAQ
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom>
                            Connect With Us
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Facebook />
                            <Twitter />
                            <Instagram />
                            <Email />
                        </Box>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} Football Jersey Store. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;