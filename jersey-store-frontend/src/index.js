// Updated index.js to address ResizeObserver loop warning

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
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
    <React.StrictMode>
        <Router>
            <CartProvider>
                <App />
            </CartProvider>
        </Router>
    </React.StrictMode>
);
