// Updated Footer.js with Material-UI components and styling

import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

// Define footer links data
const footerLinks = {
    company: [
        { name: 'About Us', url: '/about' },
        { name: 'Contact', url: '/contact' },
        { name: 'Terms & Conditions', url: '/terms' },
        { name: 'Privacy Policy', url: '/privacy' }
    ],
    support: [
        { name: 'FAQ', url: '/faq' },
        { name: 'Shipping', url: '/shipping' },
        { name: 'Returns', url: '/returns' },
        { name: 'Size Guide', url: '/size-guide' }
    ],
    social: [
        { name: 'Facebook', url: '#' },
        { name: 'Twitter', url: '#' },
        { name: 'Instagram', url: '#' },
        { name: 'YouTube', url: '#' }
    ]
};

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 4,
                mt: 'auto',
                backgroundColor: 'primary.main',
                color: 'white',
                borderTop: '1px solid',
                borderColor: 'primary.dark',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 600,
                                mb: 2,
                            }}
                        >
                            Jersey Store
                        </Typography>
                        <Typography variant="body2">
                            Your one-stop shop for authentic sports jerseys.
                        </Typography>
                    </Grid>
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <Grid item xs={12} sm={6} md={2} key={category}>
                            <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                                {category}
                            </Typography>
                            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                {links.map((link) => (
                                    <Box component="li" key={link.name} sx={{ mb: 1 }}>
                                        <Link
                                            href={link.url}
                                            color="inherit"
                                            sx={{
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {link.name}
                                        </Link>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    ))}
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