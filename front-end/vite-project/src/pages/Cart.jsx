import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartLoading, fetchCart, setCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      setCart((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      setCart((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Could not update quantity.";
      alert(msg);
    }
  };

  if (cartLoading) {
    return (
      <div className="products-page">
        <div className="state-message">
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="products-page">
        <div className="state-message">
          <p style={{ fontSize: "48px", marginBottom: "8px" }}>🛒</p>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
            Your cart is empty
          </p>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            Add products to get started.
          </p>
          <button className="btn-primary" onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1 className="products-title">My Cart</h1>

      <div className="cart-layout">
        {/* Cart items */}
        <div className="cart-items">
          {cart.map((item) => (
            <div className="cart-item-card" key={item.product._id}>
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product.name}</h3>
                <p className="cart-item-price">
                  ₹{item.product.price.toLocaleString()}
                </p>
                <p className="cart-item-stock">
                  {item.product.stock} in stock
                </p>

                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(item.product._id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() =>
                      handleQuantityChange(item.product._id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>

                <p className="cart-item-subtotal">
                  Subtotal: ₹
                  {(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>

              <button
                className="remove-btn"
                onClick={() => handleRemove(item.product._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>

          <button
            className="btn-primary checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
