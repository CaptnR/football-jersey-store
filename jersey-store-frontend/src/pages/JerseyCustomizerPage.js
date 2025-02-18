import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { API } from '../api/api';
import {
  Container,
  Grid,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import JerseyDesigns from '../components/JerseyDesigns';
import JerseyPreview from '../components/JerseyPreview';
import { CURRENCY, BASE_PRICES } from '../utils/constants';

function JerseyCustomizerPage() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [activeTab, setActiveTab] = useState('design');
  const [customization, setCustomization] = useState({
    design: 'classic',
    primaryColor: '#0066cc',
    secondaryColor: '#ffffff',
    playerName: '',
    playerNumber: '',
    nameColor: '#ffffff',
    numberColor: '#ffffff',
    text: '',
    logo: null
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCustomizationChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveJersey = async () => {
    try {
      const response = await API.post('/customizations/', {
        design: customization.design,
        primary_color: customization.primaryColor,
        secondary_color: customization.secondaryColor,
        name: customization.playerName,
        number: customization.playerNumber,
        name_color: customization.nameColor,
        number_color: customization.numberColor,
        text: customization.text,
        logo: customization.logo
      });

      addToCart({
        id: response.data.id,
        type: 'custom',
        playerName: customization.playerName,
        playerNumber: customization.playerNumber,
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        price: BASE_PRICES.customJersey,
        quantity: 1
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error in handleSaveJersey:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Customize Your Jersey
      </Typography>
      
      <Grid container spacing={4} alignItems="flex-start">
        {/* Left side - Jersey Preview */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              height: '600px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <JerseyPreview 
              customization={{
                ...customization,
                number: customization.playerNumber,
                name: customization.playerName
              }} 
            />
          </Paper>
        </Grid>

        {/* Right side - Customization Options */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              position: 'sticky',
              top: '20px'
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: 2
                }
              }}
            >
              <Tab label="Design" value="design" />
              <Tab label="Colors" value="colors" />
              <Tab label="Player" value="player" />
              <Tab label="Logo" value="logo" />
            </Tabs>

            <Box sx={{ p: 3, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {activeTab === 'design' && (
                <JerseyDesigns
                  selectedDesign={customization.design}
                  onDesignSelect={(design) => handleCustomizationChange('design', design)}
                />
              )}

              {activeTab === 'colors' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Jersey Color
                  </Typography>
                  <TextField
                    fullWidth
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                    sx={{ 
                      mb: 3,
                      '& input': {
                        height: '50px',
                        cursor: 'pointer'
                      }
                    }}
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Design Color
                  </Typography>
                  <TextField
                    fullWidth
                    type="color"
                    value={customization.secondaryColor}
                    onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                    sx={{ 
                      mb: 3,
                      '& input': {
                        height: '50px',
                        cursor: 'pointer'
                      }
                    }}
                  />

                  <Typography variant="subtitle1" gutterBottom>
                    Name Color
                  </Typography>
                  <TextField
                    fullWidth
                    type="color"
                    value={customization.nameColor}
                    onChange={(e) => handleCustomizationChange('nameColor', e.target.value)}
                    sx={{ 
                      mb: 3,
                      '& input': {
                        height: '50px',
                        cursor: 'pointer'
                      }
                    }}
                  />

                  <Typography variant="subtitle1" gutterBottom>
                    Number Color
                  </Typography>
                  <TextField
                    fullWidth
                    type="color"
                    value={customization.numberColor}
                    onChange={(e) => handleCustomizationChange('numberColor', e.target.value)}
                    sx={{ 
                      '& input': {
                        height: '50px',
                        cursor: 'pointer'
                      }
                    }}
                  />
                </Box>
              )}

              {activeTab === 'player' && (
                <Box>
                  <TextField
                    fullWidth
                    label="Player Name"
                    value={customization.playerName}
                    onChange={(e) => handleCustomizationChange('playerName', e.target.value)}
                    sx={{ mb: 3 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Player Number"
                    value={customization.playerNumber}
                    onChange={(e) => handleCustomizationChange('playerNumber', e.target.value)}
                    inputProps={{ maxLength: 2 }}
                  />
                </Box>
              )}

              {activeTab === 'logo' && (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ height: '100px' }}
                  >
                    {customization.logo ? 'Change Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleCustomizationChange('logo', URL.createObjectURL(file));
                        }
                      }}
                    />
                  </Button>
                  
                  {customization.logo && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img 
                        src={customization.logo} 
                        alt="Uploaded logo" 
                        style={{ maxWidth: '100%', maxHeight: '100px' }} 
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider />
            
            <Box sx={{ p: 3, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total: {CURRENCY.symbol}{BASE_PRICES.customJersey.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSaveJersey}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Add to Cart
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default JerseyCustomizerPage; 