import React, { createContext, useState, useEffect } from 'react';

// Create the Cart Context
export const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
    // Initialize cart with proper structure and validation
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsedCart = savedCart ? JSON.parse(savedCart) : { items: [] };
            // Ensure the cart has the correct structure
            return {
                items: Array.isArray(parsedCart.items) ? parsedCart.items : []
            };
        } catch (error) {
            console.error('Error loading cart:', error);
            return { items: [] };
        }
    });

    // Save cart to localStorage with error handling
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }, [cart]);

    // Add an item to the cart
    const addToCart = (jersey) => {
        if (!jersey || !jersey.id) {
            console.error('Invalid jersey object:', jersey);
            return;
        }

        setCart(prevCart => {
            try {
                const existingItem = prevCart.items.find(item => item.id === jersey.id);
                if (existingItem) {
                    return {
                        items: prevCart.items.map(item =>
                            item.id === jersey.id
                                ? { ...item, quantity: (item.quantity || 1) + 1 }
                                : item
                        )
                    };
                }
                return {
                    items: [...prevCart.items, { ...jersey, quantity: 1 }]
                };
            } catch (error) {
                console.error('Error adding to cart:', error);
                return prevCart;
            }
        });
    };

    // Remove an item completely from the cart
    const removeFromCart = (jerseyId) => {
        if (!jerseyId) return;

        setCart(prevCart => ({
            items: prevCart.items.filter(item => item.id !== jerseyId)
        }));
    };

    // Decrease the quantity of an item
    const decreaseQuantity = (jerseyId) => {
        if (!jerseyId) return;

        setCart(prevCart => {
            const updatedItems = prevCart.items.map(item => {
                if (item.id === jerseyId) {
                    const newQuantity = Math.max(0, (item.quantity || 1) - 1);
                    return {
                        ...item,
                        quantity: newQuantity
                    };
                }
                return item;
            }).filter(item => item.quantity > 0);

            return { items: updatedItems };
        });
    };

    // Clear the entire cart
    const clearCart = () => {
        setCart({ items: [] });
    };

    // Provide a safe cart object
    const safeCart = {
        items: Array.isArray(cart.items) ? cart.items : [],
        ...cart
    };

    return (
        <CartContext.Provider
            value={{
                cart: safeCart,
                addToCart,
                removeFromCart,
                decreaseQuantity,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
