// Updated index.js to address ResizeObserver loop warning

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Import MUI ThemeProvider and CssBaseline
import theme from './theme/theme'; // Import the custom theme
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JerseyDetails from './pages/JerseyDetails';
import CustomizationPage from './pages/CustomizationPage';
import { setAuthToken } from './api/api';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserOrdersPage from './pages/UserOrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';

// Suppress ResizeObserver loop error globally
const resizeObserverErrorHandler = (e) => {
    if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
        e.stopImmediatePropagation();
    }
};

window.addEventListener("error", resizeObserverErrorHandler);

// Polyfill for ResizeObserver error suppression
const ResizeObserver = window.ResizeObserver;
if (ResizeObserver) {
    const ro = new ResizeObserver(() => {});
    ro.observe(document.body);
    ro.disconnect();
}

const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token); // Add token to Axios headers
}

function App() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/jersey/:id" element={<JerseyDetails />} />
                <Route path="/customize" element={<CustomizationPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<UserOrdersPage />} />
                <Route path="/admin/orders" element={isAdmin ? <AdminOrdersPage /> : <Navigate to="/login" />} />
                <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/login" />} />
                <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
            <Footer />
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ThemeProvider theme={theme}> {/* Apply the Material-UI theme */}
        <CssBaseline /> {/* Normalize and reset CSS styles */}
        <CartProvider>
            <App />
        </CartProvider>
    </ThemeProvider>
);
