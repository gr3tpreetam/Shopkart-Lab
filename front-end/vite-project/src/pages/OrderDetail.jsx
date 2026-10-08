import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isConfirmed = location.state?.confirmed;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        setError("Could not load this order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="products-page">
        <div className="state-message"><p>Loading order...</p></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="products-page">
        <div className="state-message error">
          <p>{error || "Order not found."}</p>
          <button className="btn-primary" onClick={() => navigate("/orders")}>My Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {isConfirmed && (
        <div className="success-message" style={{ maxWidth: "700px", margin: "0 auto 24px" }}>
          🎉 Order placed successfully! Thank you for shopping with ShopKart.
        </div>
      )}

      <div className="order-detail-card">
        <div className="order-card-header" style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", margin: 0 }}>
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span className={`order-status status-${order.status.toLowerCase()}`}>
            {order.status.replace("_", " ")}
          </span>
        </div>

        <h2>Items</h2>
        <table className="order-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>₹{item.price.toLocaleString()}</td>
                <td>{item.quantity}</td>
                <td>₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary-row total-row" style={{ marginTop: "16px" }}>
          <span>Total</span>
          <span>₹{order.totalAmount.toLocaleString()}</span>
        </div>

        <h2 style={{ marginTop: "28px" }}>Shipping Address</h2>
        <div className="shipping-address-box">
          <p><strong>{order.shippingAddress.fullName}</strong></p>
          <p>{order.shippingAddress.addressLine1}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          <p>📞 {order.shippingAddress.phone}</p>
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={() => navigate("/orders")}>
            My Orders
          </button>
          <button className="back-btn" onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
