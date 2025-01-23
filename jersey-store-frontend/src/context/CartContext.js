import React, { createContext, useState } from 'react';

// Create Context
export const CartContext = createContext();

// Cart Provider
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Add item to the cart
    const addToCart = (jersey) => {
        setCart((prevCart) => [...prevCart, jersey]);
    };

    // Remove item from the cart
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Clear the cart
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
