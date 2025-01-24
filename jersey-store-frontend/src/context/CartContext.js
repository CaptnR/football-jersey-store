import React, { createContext, useState } from 'react';

// Create the Cart Context
export const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Add an item to the cart
    const addToCart = (jersey) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === jersey.id);
            if (existingItem) {
                // If item already exists, increase its quantity
                return prevCart.map((item) =>
                    item.id === jersey.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Otherwise, add it to the cart with a quantity of 1
            return [...prevCart, { ...jersey, quantity: 1 }];
        });
    };

    // Remove an item completely from the cart
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Decrease the quantity of an item
    const decreaseQuantity = (id) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter((item) => item.quantity > 0) // Remove items with quantity 0
        );
    };

    // Clear the entire cart
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
};
