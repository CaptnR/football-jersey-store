// Updated WishlistPage.js with Material-UI components and styling

import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../api/api';
import { Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Alert,
} from '@mui/material';

function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await getWishlist(token);
                setWishlist(response.data);
            } catch (error) {
                console.error('Error fetching wishlist:', error.response || error.message);
            }
        };

        fetchWishlist();
    }, [token]);

    const handleRemove = async (jersey) => {
        try {
            const jerseyId = jersey.id;
            console.log('Removing jersey with ID:', jerseyId);
            
            const response = await removeFromWishlist(jerseyId);
            if (response.status === 204) {
                setWishlist(prevItems => 
                    prevItems.filter(item => item.id !== jerseyId)
                );
            }
        } catch (error) {
            console.error('Error removing item from wishlist:', error.response || error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Your Wishlist
            </Typography>

            {wishlist.length === 0 ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    Your wishlist is empty. Start adding your favorite jerseys!
                </Alert>
            ) : (
                <Grid container spacing={4}>
                    {wishlist.map((jersey) => (
                        <Grid item xs={12} sm={6} md={4} key={jersey.id}>
                            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={jersey.image}
                                    alt={jersey.player.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        component={Link}
                                        to={`/jersey/${jersey.id}`}
                                        sx={{ textDecoration: 'none', color: 'primary.main' }}
                                    >
                                        {jersey.player.name}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        ${jersey.price}
                                    </Typography>
                                </CardContent>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleRemove(jersey)}
                                    sx={{ m: 2 }}
                                >
                                    Remove from Wishlist
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

export default WishlistPage;
