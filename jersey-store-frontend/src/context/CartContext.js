import React, { createContext, useState, useEffect } from 'react';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Create the Cart Context
export const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Initialize cart from localStorage if available
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [loading, setLoading] = useState(false);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            const isCustom = item.type === 'custom';
            const newItem = {
                ...item,
                id: isCustom ? `custom-${Date.now()}` : item.id,
                type: isCustom ? 'custom' : 'regular',
                primary_image: isCustom ? '/images/placeholder.jpg' : item.primary_image // Use absolute path
            };
            
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(i => 
                isCustom ? 
                (i.type === 'custom' && i.name === item.name && i.size === item.size) : 
                (i.id === item.id && i.size === item.size)
            );

            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += item.quantity || 1;
                return updatedItems;
            }

            return [...prevItems, newItem];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const calculateTotal = () => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((total, item) => {
            const itemPrice = item.sale_price || item.price;
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            calculateTotal,
            clearCart,
            loading,
            setLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};
