import React, { createContext, useState, useEffect } from 'react';

// Create the Cart Context
export const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cartItems]);

    const addToCart = (jersey) => {
        setCartItems(prevItems => {
            // Ensure prevItems is an array
            const items = Array.isArray(prevItems) ? prevItems : [];
            const existingItem = items.find(item => item.id === jersey.id);
            
            if (existingItem) {
                return items.map(item =>
                    item.id === jersey.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...items, { ...jersey, quantity: 1 }];
        });
    };

    const removeFromCart = (jerseyId) => {
        setCartItems(prevItems => {
            // Ensure prevItems is an array
            const items = Array.isArray(prevItems) ? prevItems : [];
            return items.filter(item => item.id !== jerseyId);
        });
    };

    const updateQuantity = (jerseyId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems => {
            // Ensure prevItems is an array
            const items = Array.isArray(prevItems) ? prevItems : [];
            return items.map(item =>
                item.id === jerseyId ? { ...item, quantity } : item
            );
        });
    };

    const calculateTotal = () => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            calculateTotal,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
