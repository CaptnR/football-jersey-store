// Updated index.js to address ResizeObserver loop warning

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Import MUI ThemeProvider and CssBaseline
import theme from './theme/theme'; // Import the custom theme
import App from './App';  // Make sure App is properly imported
import { CartProvider } from './context/CartContext';

// Suppress ResizeObserver loop error
const resizeObserverErrorHandler = (e) => {
    if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.stopImmediatePropagation();
    }
};

window.addEventListener("error", resizeObserverErrorHandler);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <CartProvider>
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <App />
            </BrowserRouter>
        </CartProvider>
    </ThemeProvider>
);
