import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <>
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
    </>
  );
}

export default App;
