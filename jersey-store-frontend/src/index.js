// Updated index.js to address ResizeObserver loop warning

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import App from './App';

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
        <BrowserRouter>
            <CartProvider>
                <App />
            </CartProvider>
        </BrowserRouter>
    </React.StrictMode>
);
