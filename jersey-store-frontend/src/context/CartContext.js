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
            console.error('Error parsing cart from localStorage:', error);
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
            const existingItem = prevItems.find(item => item.id === jersey.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === jersey.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...jersey, quantity: 1 }];
        });
    };

    const removeFromCart = (jerseyId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== jerseyId));
    };

    const updateQuantity = (jerseyId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === jerseyId ? { ...item, quantity } : item
            )
        );
    };

    const calculateTotal = () => {
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
