import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
    const { cart, removeFromCart, clearCart } = useContext(CartContext);

    if (cart.length === 0) {
        return (
            <main className="container">
                <h1>Your Cart</h1>
                <p>Your cart is empty. <Link to="/">Continue Shopping</Link></p>
            </main>
        );
    }

    const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price), 0);

    return (
        <main className="container">
            <h1>Your Cart</h1>
            <div>
                {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                            <h2>{item.player?.name || "Jersey"}</h2>
                            <p>${item.price}</p>
                        </div>
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
            <h2>Total Price: ${totalPrice.toFixed(2)}</h2>
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
