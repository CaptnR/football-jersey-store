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
  Card,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import JerseyDesigns from '../components/JerseyDesigns';
import JerseyPreview from '../components/JerseyPreview';
import { CURRENCY, BASE_PRICES } from '../utils/constants';
import FlipIcon from '@mui/icons-material/Flip';

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
    frontText: '',
    frontTextType: 'team'
  });
  const [showFront, setShowFront] = useState(false);

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
        logo: customization.logo,
        front_text: customization.frontText,
        front_text_type: customization.frontTextType
      });

      addToCart({
        id: response.data.id,
        type: 'custom',
        playerName: customization.playerName,
        playerNumber: customization.playerNumber,
        primaryColor: customization.primaryColor,
        secondaryColor: customization.secondaryColor,
        frontText: customization.frontText,
        frontTextType: customization.frontTextType,
        price: BASE_PRICES.customJersey,
        quantity: 1
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error in handleSaveJersey:', error);
    }
  };

  const handleFlipJersey = () => {
    setShowFront(!showFront);
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
            <IconButton 
              onClick={handleFlipJersey}
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <FlipIcon />
            </IconButton>
            <Box sx={{ position: 'relative' }}>
              <JerseyPreview 
                customization={customization}
                showFront={showFront}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Customization Options */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ mb: 3 }}
            >
              <Tab value="design" label="Design" />
              <Tab value="text" label="Text" />
            </Tabs>

            {activeTab === 'design' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <JerseyDesigns
                  selectedDesign={customization.design}
                  onDesignSelect={(design) => handleCustomizationChange('design', design)}
                />

                {/* Add Color Customization Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Colors
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Primary Color
                      </Typography>
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        style={{ width: '100%', height: '40px' }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Secondary Color
                      </Typography>
                      <input
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                        style={{ width: '100%', height: '40px' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 'text' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleFlipJersey}
                  startIcon={<FlipIcon />}
                  sx={{ mb: 2 }}
                >
                  {showFront ? 'Show Back Side' : 'Show Front Side'}
                </Button>

                {showFront ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Front Text Customization
                    </Typography>
                    
                    <FormControl fullWidth>
                      <InputLabel>Text Type</InputLabel>
                      <Select
                        value={customization.frontTextType}
                        onChange={(e) => handleCustomizationChange('frontTextType', e.target.value)}
                        label="Text Type"
                      >
                        <MenuItem value="team">Team Name</MenuItem>
                        <MenuItem value="sponsor">Sponsor Name</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label={customization.frontTextType === 'team' ? 'Team Name' : 'Sponsor Name'}
                      value={customization.frontText}
                      onChange={(e) => handleCustomizationChange('frontText', e.target.value)}
                      variant="outlined"
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Back Text Customization
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Player Name"
                      value={customization.playerName}
                      onChange={(e) => handleCustomizationChange('playerName', e.target.value)}
                      variant="outlined"
                    />

                    <TextField
                      fullWidth
                      label="Player Number"
                      value={customization.playerNumber}
                      onChange={(e) => handleCustomizationChange('playerNumber', e.target.value)}
                      variant="outlined"
                    />
                  </>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Text Color
                  </Typography>
                  <input
                    type="color"
                    value={customization.nameColor}
                    onChange={(e) => handleCustomizationChange('nameColor', e.target.value)}
                    style={{ width: '100%', height: '40px' }}
                  />
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Price: ₹{BASE_PRICES.customJersey}
              </Typography>
              <Button
                variant="contained"
                onClick={handleSaveJersey}
                size="large"
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