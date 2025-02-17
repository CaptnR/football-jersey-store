import React from 'react';
import { Box } from '@mui/material';

// Standard US Men's Large T-shirt dimensions (in SVG units)
const JERSEY_WIDTH = 160;  // Main body width
const JERSEY_HEIGHT = 280; // Total height
const SLEEVE_WIDTH = 40;   // Sleeve width
const NECK_WIDTH = 40;     // Neck width
const SHOULDER_DROP = 0;   // Sleeves start at top

// Updated jersey shape with right-angled triangular sleeves
export const jerseyShape = `
  M${150 - JERSEY_WIDTH/2} 40
  L${150 + JERSEY_WIDTH/2} 40
  L${150 + JERSEY_WIDTH/2} ${40 + SHOULDER_DROP}
  L${150 + JERSEY_WIDTH/2 + SLEEVE_WIDTH} ${40 + SHOULDER_DROP}
  L${150 + JERSEY_WIDTH/2} ${40 + SLEEVE_WIDTH}
  L${150 + JERSEY_WIDTH/2} ${40 + JERSEY_HEIGHT}
  L${150 - JERSEY_WIDTH/2} ${40 + JERSEY_HEIGHT}
  L${150 - JERSEY_WIDTH/2} ${40 + SLEEVE_WIDTH}
  L${150 - JERSEY_WIDTH/2 - SLEEVE_WIDTH} ${40 + SHOULDER_DROP}
  L${150 - JERSEY_WIDTH/2} ${40 + SHOULDER_DROP}
  Z
`;

const BaseJersey = ({ primaryColor, secondaryColor, children }) => (
  <g>
    {/* Base Jersey */}
    <path d={jerseyShape} fill={primaryColor} />
    
    {/* V-neck collar */}
    <path 
      d={`M${150 - NECK_WIDTH/2} 40L150 55L${150 + NECK_WIDTH/2} 40`}
      stroke={secondaryColor} 
      strokeWidth="2" 
      fill="none" 
    />
    
    {/* Sleeve outlines */}
    <path 
      d={`M${150 - JERSEY_WIDTH/2} ${40 + SHOULDER_DROP}
         L${150 - JERSEY_WIDTH/2 - SLEEVE_WIDTH} ${40 + SHOULDER_DROP}
         L${150 - JERSEY_WIDTH/2} ${40 + SLEEVE_WIDTH}`}
      stroke={secondaryColor} 
      strokeWidth="1" 
      fill="none"
    />
    <path 
      d={`M${150 + JERSEY_WIDTH/2} ${40 + SHOULDER_DROP}
         L${150 + JERSEY_WIDTH/2 + SLEEVE_WIDTH} ${40 + SHOULDER_DROP}
         L${150 + JERSEY_WIDTH/2} ${40 + SLEEVE_WIDTH}`}
      stroke={secondaryColor} 
      strokeWidth="1" 
      fill="none"
    />
    
    {/* Design Elements */}
    {children}
  </g>
);

export const jerseyTemplates = [
  {
    id: 'classic',
    name: 'Classic',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* Simple clean design with collar accent */}
        <path 
          d={`M${150 - JERSEY_WIDTH/2} 90h${JERSEY_WIDTH}`} 
          stroke={secondaryColor} 
          strokeWidth="3"
          fill="none"
        />
      </BaseJersey>
    )
  },
  {
    id: 'stripes',
    name: 'Stripes',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* Barcelona style vertical stripes */}
        <g>
          {[0, 1, 2].map(i => (
            <rect
              key={i}
              x={150 - JERSEY_WIDTH/3 + (i * JERSEY_WIDTH/3)}
              y={40}
              width={JERSEY_WIDTH/6}
              height={JERSEY_HEIGHT + SHOULDER_DROP}
              fill={secondaryColor}
            />
          ))}
        </g>
      </BaseJersey>
    )
  },
  {
    id: 'hoops',
    name: 'Hoops',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* Celtic style horizontal hoops */}
        <g>
          {[0, 1, 2, 3, 4].map(i => (
            <rect
              key={i}
              x={150 - JERSEY_WIDTH/2}
              y={80 + (i * 50)}
              width={JERSEY_WIDTH}
              height="25"
              fill={secondaryColor}
            />
          ))}
        </g>
      </BaseJersey>
    )
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* River Plate style diagonal stripe */}
        <path
          d={`M${150 - JERSEY_WIDTH/2} 40 
              L${150 + JERSEY_WIDTH/2} ${40 + JERSEY_HEIGHT}
              l-30 0
              L${150 - JERSEY_WIDTH/2} 70Z`}
          fill={secondaryColor}
        />
      </BaseJersey>
    )
  },
  {
    id: 'chevron',
    name: 'Chevron',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* PSG style center stripe with chevron */}
        <path
          d={`M${150 - 30} 40
              L150 80
              L${150 + 30} 40
              L${150 + 30} ${40 + JERSEY_HEIGHT}
              L${150 - 30} ${40 + JERSEY_HEIGHT}Z`}
          fill={secondaryColor}
        />
      </BaseJersey>
    )
  },
  {
    id: 'gradient',
    name: 'Gradient',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* Modern gradient design */}
        <defs>
          <linearGradient id="gradientStripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: primaryColor }} />
            <stop offset="50%" style={{ stopColor: secondaryColor }} />
            <stop offset="100%" style={{ stopColor: primaryColor }} />
          </linearGradient>
        </defs>
        <rect
          x={150 - JERSEY_WIDTH/2}
          y={40}
          width={JERSEY_WIDTH}
          height={JERSEY_HEIGHT}
          fill="url(#gradientStripe)"
        />
      </BaseJersey>
    )
  },
  {
    id: 'pinstripes',
    name: 'Pinstripes',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* Inter Milan style pinstripes */}
        <g>
          {[...Array(8)].map((_, i) => (
            <path
              key={i}
              d={`M${150 - JERSEY_WIDTH/2 + (i * JERSEY_WIDTH/8)} 40
                 L${150 - JERSEY_WIDTH/2 + (i * JERSEY_WIDTH/8)} ${40 + JERSEY_HEIGHT}`}
              stroke={secondaryColor}
              strokeWidth="2"
            />
          ))}
        </g>
      </BaseJersey>
    )
  },
  {
    id: 'cross',
    name: 'Cross',
    render: (primaryColor, secondaryColor) => (
      <BaseJersey primaryColor={primaryColor} secondaryColor={secondaryColor}>
        {/* AC Milan style cross */}
        <g>
          <rect
            x={150 - 15}
            y={40}
            width="30"
            height={JERSEY_HEIGHT}
            fill={secondaryColor}
          />
          <rect
            x={150 - JERSEY_WIDTH/2}
            y={120}
            width={JERSEY_WIDTH}
            height="30"
            fill={secondaryColor}
          />
        </g>
      </BaseJersey>
    )
  }
];

// Update the container component to better position the jersey preview
const JerseyContainer = ({ children }) => (
  <Box 
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      paddingTop: '40px'
    }}
  >
    {children}
  </Box>
); 