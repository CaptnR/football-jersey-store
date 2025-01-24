import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

function CartPage() {
    const { cart, addToCart, removeFromCart, decreaseQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <main className="container">
                <h1>Your Cart</h1>
                <p>Your cart is empty. <Link to="/">Continue Shopping</Link></p>
            </main>
        );
    }

    const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

    return (
        <main className="container">
            <h1>Your Cart</h1>
            <div className="grid">
                {cart.map((item) => (
                    <div key={item.id} className="card" style={{ padding: '10px' }}>
                        <img
                            src={item.image}
                            alt="Jersey"
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '5px',
                            }}
                        />
                        <h2>{item.player?.name || "Jersey"}</h2>
                        <p>${item.price} x {item.quantity}</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="button-secondary"
                            >
                                -
                            </button>
                            <button
                                onClick={() => addToCart(item)}
                                className="button-secondary"
                            >
                                +
                            </button>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="button-primary"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <h2>Total: ${totalPrice.toFixed(2)}</h2>
            {/* Replace "Checkout" button logic */}
            <button
                onClick={() => navigate('/checkout')} // Use navigate to go to the checkout page
                className="button-primary"
            >
                Checkout
            </button>
        </main>
    );
}

export default CartPage;
