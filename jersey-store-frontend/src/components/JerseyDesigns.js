import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import { jerseyTemplates } from '../utils/jerseyDesigns';

const JerseyDesigns = ({ selectedDesign, onDesignSelect }) => {
  return (
    <Grid container spacing={2}>
      {jerseyTemplates.map((template) => (
        <Grid item xs={6} sm={4} key={template.id}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              cursor: 'pointer',
              backgroundColor: selectedDesign === template.id ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
              border: selectedDesign === template.id ? '2px solid #1976d2' : '2px solid transparent',
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
            onClick={() => onDesignSelect(template.id)}
          >
            <Box sx={{
              aspectRatio: '3/4',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              p: 1,
              mb: 1
            }}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 400"
                preserveAspectRatio="xMidYMid meet"
              >
                {template.render('#1976d2', '#ffffff')}
              </svg>
            </Box>
            <Typography
              variant="body2"
              align="center"
              sx={{
                fontWeight: selectedDesign === template.id ? 600 : 400
              }}
            >
              {template.name}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default JerseyDesigns; 