import React from 'react';
import { Box } from '@mui/material';
import { jerseyTemplates } from '../utils/jerseyDesigns';

const JerseyPreview = ({ customization }) => {
  const { 
    design, 
    primaryColor, 
    secondaryColor, 
    name, 
    number,
    nameColor,
    numberColor
  } = customization;

  const template = jerseyTemplates.find(t => t.id === design) || jerseyTemplates[0];

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{
        width: '300px',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '24px',
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 400"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render selected template */}
          {template.render(primaryColor, secondaryColor)}
          
          {/* Player Name */}
          <text
            x="150"
            y="90"
            textAnchor="middle"
            fill={nameColor}
            fontSize="20"
            fontFamily="Arial"
          >
            {name?.toUpperCase()}
          </text>
          
          {/* Player Number */}
          <text
            x="150"
            y="200"
            textAnchor="middle"
            fill={numberColor}
            fontSize="80"
            fontFamily="Arial"
            fontWeight="bold"
          >
            {number}
          </text>
        </svg>
      </Box>
    </Box>
  );
};

export default JerseyPreview; 