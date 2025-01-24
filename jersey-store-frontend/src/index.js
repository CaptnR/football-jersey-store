import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JerseyDetails from './pages/JerseyDetails';
import CustomizationPage from './pages/CustomizationPage';
import { setAuthToken } from './api/api';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token); // Add token to Axios headers
}

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/jersey/:id" element={<JerseyDetails />} />
                <Route path="/customize" element={<CustomizationPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
            <Footer />
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CartProvider>
        <App />
    </CartProvider>
);
