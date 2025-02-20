import React from 'react';
import { Box } from '@mui/material';
import { jerseyTemplates } from '../utils/jerseyDesigns';

const JerseyPreview = ({ customization, showFront }) => {
  const { 
    design, 
    primaryColor, 
    secondaryColor, 
    playerName,
    playerNumber,
    nameColor,
    frontText = '',
    frontTextType
  } = customization;

  const template = jerseyTemplates.find(t => t.id === design) || jerseyTemplates[0];

  // Convert all text values to strings and handle null/undefined
  const displayName = String(playerName || '').toUpperCase();
  const displayNumber = String(playerNumber || '');
  const displayFrontText = String(frontText || '').toUpperCase();

  console.log('Front text:', displayFrontText); // Add this for debugging

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
        position: 'relative'
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 400"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Jersey Template */}
          <g style={{ transform: showFront ? 'scaleX(-1)' : 'none', transformOrigin: 'center' }}>
            {template.render(primaryColor, secondaryColor)}
          </g>

          {/* Text Layer */}
          <g style={{ transform: showFront ? 'scaleX(-1)' : 'none', transformOrigin: 'center' }}>
            {showFront ? (
              // Front Text (Team/Sponsor Name)
              <>
                <text
                  x="150"
                  y="120"
                  textAnchor="middle"
                  fill={nameColor}
                  fontSize="28"
                  fontFamily="Arial"
                  fontWeight="bold"
                  style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
                >
                  {displayFrontText}
                </text>
                
                {frontTextType === 'sponsor' && (
                  <text
                    x="150"
                    y="145"
                    textAnchor="middle"
                    fill={nameColor}
                    fontSize="14"
                    fontFamily="Arial"
                    opacity="0.8"
                    style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
                  >
                    SPONSOR
                  </text>
                )}
              </>
            ) : (
              // Back Text (Player Name & Number)
              <>
                {displayName && (
                  <text
                    x="150"
                    y="90"
                    textAnchor="middle"
                    fill={nameColor}
                    fontSize="24"
                    fontFamily="Arial"
                    fontWeight="bold"
                  >
                    {displayName}
                  </text>
                )}
                
                {displayNumber && (
                  <text
                    x="150"
                    y="200"
                    textAnchor="middle"
                    fill={nameColor}
                    fontSize="80"
                    fontFamily="Arial"
                    fontWeight="bold"
                  >
                    {displayNumber}
                  </text>
                )}
              </>
            )}
          </g>
        </svg>
      </Box>
    </Box>
  );
};

export default JerseyPreview; 