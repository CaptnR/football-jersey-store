import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JerseyDetails from './pages/JerseyDetails';
import CustomizationPage from './pages/CustomizationPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserOrdersPage from './pages/UserOrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { Box } from '@mui/material';

function PrivateRoute({ children }) {
    const isAuthenticated = !!localStorage.getItem('token');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CartProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <Box component="main" sx={{ flex: 1, width: '100%' }}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/jersey/:id" element={<JerseyDetails />} />
                            <Route path="/customize" element={<CustomizationPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                            
                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <PrivateRoute>
                                    <DashboardPage />
                                </PrivateRoute>
                            } />
                            <Route path="/cart" element={
                                <PrivateRoute>
                                    <CartPage />
                                </PrivateRoute>
                            } />
                            <Route path="/checkout" element={
                                <PrivateRoute>
                                    <CheckoutPage />
                                </PrivateRoute>
                            } />
                            <Route path="/orders" element={
                                <PrivateRoute>
                                    <UserOrdersPage />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/orders" element={
                                <PrivateRoute>
                                    <AdminOrdersPage />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/dashboard" element={
                                <PrivateRoute>
                                    <AdminDashboardPage />
                                </PrivateRoute>
                            } />
                        </Routes>
                    </Box>
                    <Footer />
                </Box>
            </CartProvider>
        </ThemeProvider>
    );
}

export default App;
