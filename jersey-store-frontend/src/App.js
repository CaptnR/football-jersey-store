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

function PrivateRoute({ children }) {
    const isAuthenticated = !!localStorage.getItem('token');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
}

function App() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
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
                <Route path="/jersey/:id" element={<JerseyDetails />} />
                <Route path="/customize" element={<CustomizationPage />} />
                <Route path="/orders" element={<UserOrdersPage />} />
                <Route path="/admin/orders" element={isAdmin ? <AdminOrdersPage /> : <Navigate to="/login" />} />
                <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/login" />} />
                <Route path="/wishlist" element={<WishlistPage />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
