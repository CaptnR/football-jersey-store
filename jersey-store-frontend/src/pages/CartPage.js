import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
    const { cart, addToCart, removeFromCart, decreaseQuantity, clearCart } = useContext(CartContext);

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
            <div>
                {cart.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                        }}
                    >
                        {/* Item Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                                src={item.image}
                                alt={item.player?.name || "Jersey"}
                                style={{ width: '60px', height: '60px', borderRadius: '5px' }}
                            />
                            <div>
                                <h2 style={{ margin: 0 }}>{item.player?.name || "Jersey"}</h2>
                                <p style={{ margin: 0 }}>${item.price} x {item.quantity}</p>
                            </div>
                        </div>

                        {/* Quantity Management */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => decreaseQuantity(item.id)}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffc107',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => addToCart(item)}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                +
                            </button>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '5px 10px',
                                cursor: 'pointer',
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Total Price */}
            <h2>Total Price: ${totalPrice.toFixed(2)}</h2>

            {/* Checkout Button */}
            <button
                onClick={clearCart}
                style={{
                    backgroundColor: 'green',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    marginTop: '10px',
                }}
            >
                Checkout
            </button>
        </main>
    );
}

export default CartPage;
