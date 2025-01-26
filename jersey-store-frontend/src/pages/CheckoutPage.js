import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

function CheckoutPage() {
    const { cart, clearCart } = useContext(CartContext);
    const [nameOnCard, setNameOnCard] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const navigate = useNavigate();

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const orderDetails = {
            cart_items: cart, // Cart items
            total_price: totalPrice, // Total price
            payment: {
                name_on_card: nameOnCard,
                card_number: cardNumber,
                expiration_date: expirationDate,
            },
        };
    
        try {
            const token = localStorage.getItem('token'); // Retrieve token from localStorage
            if (!token) {
                throw new Error('User is not authenticated. Token is missing.');
            }
            console.log('Sending request with token:', token); // Log token for debugging
    
            await axios.post('http://127.0.0.1:8000/api/checkout/', orderDetails, {
                headers: {
                    Authorization: `Token ${token}`, // Include token in Authorization header
                },
            });
    
            alert('Order placed successfully!');
            clearCart();
            navigate('/');
        } catch (error) {
            console.error('Error during checkout:', error.response || error.message);
            alert('Checkout failed. Please try again.');
        }
    };

    return (
        <main className="container">
            <header>
                <h1>Checkout</h1>
            </header>
            <h2>Order Summary</h2>
            <ul>
                {cart.map((item) => (
                    <li key={item.id}>
                        {item.player?.name || 'Jersey'} - ${item.price} x {item.quantity}
                    </li>
                ))}
            </ul>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                    Name on Card
                    <input
                        type="text"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Card Number
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        maxLength="16"
                    />
                </label>
                <label>
                    Expiration Date (MM/YY)
                    <input
                        type="text"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        required
                        maxLength="5"
                    />
                </label>
                <button type="submit" className="button-primary">
                    Pay Now
                </button>
            </form>
            <footer>
                <p>&copy; 2023 Jersey Store</p>
            </footer>
        </main>
    );
}

export default CheckoutPage;
