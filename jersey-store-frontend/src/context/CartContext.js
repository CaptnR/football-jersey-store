import React, { createContext, useState, useEffect } from 'react';

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
        console.log('Adding item to cart:', item); // Debug log
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => 
                i.id === item.id && i.size === item.size
            );

            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id && i.size === item.size
                        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                        : i
                );
            }

            // Make sure we're storing all the necessary data
            const newItem = {
                ...item,
                quantity: item.quantity || 1,
                primary_image: item.primary_image,
                images: item.images
            };
            console.log('New item being added:', newItem); // Debug log
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
