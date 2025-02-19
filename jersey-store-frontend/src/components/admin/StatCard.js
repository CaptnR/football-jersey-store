import React from 'react';
import { Card, Box, Typography } from '@mui/material';

function StatCard({ title, value, icon, color }) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                    {value}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </Card>
    );
}

export default StatCard; 