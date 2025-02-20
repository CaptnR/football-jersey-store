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
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import { Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import TestErrorComponent from './components/TestErrorComponent';
import JerseyCustomizerPage from './pages/JerseyCustomizerPage';
import AdminSalesPage from './pages/AdminSalesPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './context/AuthContext';

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
        <AuthProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ErrorBoundary>
                    <ThemeProvider theme={theme}>
                        <ToastProvider>
                            <CartProvider>
                                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                                    <Navbar />
                                    <Box component="main" sx={{ flex: 1, width: '100%' }}>
                                        <Routes>
                                            <Route path="/" element={<HomePage />} />
                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/signup" element={<SignupPage />} />
                                            <Route path="/jersey/:id" element={<JerseyDetails />} />
                                            <Route path="/customize" element={<JerseyCustomizerPage />} />
                                            <Route path="/wishlist" element={<WishlistPage />} />
                                            <Route path="/test-error" element={<TestErrorComponent />} />
                                            
                                            {/* Protected Routes */}
                                            <Route path="/dashboard" element={<DashboardPage />} />
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
                                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                                            <Route path="/admin/sales" element={
                                                <PrivateRoute>
                                                    <AdminSalesPage />
                                                </PrivateRoute>
                                            } />
                                        </Routes>
                                    </Box>
                                    <Footer />
                                </Box>
                            </CartProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </ErrorBoundary>
            </LocalizationProvider>
        </AuthProvider>
    );
}

export default App;
