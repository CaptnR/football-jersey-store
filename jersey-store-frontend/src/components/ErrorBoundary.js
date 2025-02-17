import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    state = { hasError: false, errorInfo: null };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        maxWidth: 600,
                        margin: '0 auto',
                        mt: 4
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        Oops! Something went wrong
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        We're sorry for the inconvenience. Please try refreshing the page.
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => window.location.reload()}
                        sx={{ mr: 2 }}
                    >
                        Refresh Page
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={() => window.location.href = '/'}
                    >
                        Go to Homepage
                    </Button>
                </Box>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary; 