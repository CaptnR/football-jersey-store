import React from 'react';

const JerseyPattern = ({ pattern, colors }) => {
  const renderPattern = () => {
    switch (pattern) {
      case 'solid':
        return (
          <g>
            <rect width="100%" height="100%" fill={colors.primary} />
          </g>
        );
      
      case 'stripes':
        return (
          <g>
            <rect width="100%" height="100%" fill={colors.primary} />
            <path d="M0 100 L300 50 L300 100 L0 150 Z" fill={colors.secondary} />
            <path d="M0 200 L300 150 L300 200 L0 250 Z" fill={colors.secondary} />
          </g>
        );
      
      case 'diagonal':
        return (
          <g>
            <rect width="100%" height="100%" fill={colors.primary} />
            <path d="M-100 0 L400 400" stroke={colors.secondary} strokeWidth="50" />
            {colors.accent && 
              <path d="M-150 0 L350 400" stroke={colors.accent} strokeWidth="25" />
            }
          </g>
        );
      
      case 'vShape':
        return (
          <g>
            <rect width="100%" height="100%" fill={colors.primary} />
            <path d="M0 100 L150 200 L300 100" fill="none" stroke={colors.secondary} strokeWidth="30" />
            {colors.accent && 
              <path d="M0 120 L150 220 L300 120" fill="none" stroke={colors.accent} strokeWidth="15" />
            }
          </g>
        );
      
      default:
        return null;
    }
  };

  return (
    <svg 
      viewBox="0 0 300 400" 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block'
      }}
    >
      {renderPattern()}
    </svg>
  );
};

export const jerseyPatterns = {
  solid: { name: "Solid" },
  stripes: { name: "Stripes" },
  diagonal: { name: "Diagonal" },
  vShape: { name: "V-Shape" }
};

export default JerseyPattern; 