import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      setError("Could not load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="products-page">
        <div className="state-message"><p>Loading your orders...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="state-message error">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchOrders}>Try Again</button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="products-page">
        <div className="state-message">
          <p style={{ fontSize: "48px" }}>📦</p>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>No orders yet</p>
          <p style={{ color: "#888", marginBottom: "24px" }}>Start shopping to see orders here.</p>
          <button className="btn-primary" onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1 className="products-title">My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div
            className="order-card"
            key={order._id}
            onClick={() => navigate(`/orders/${order._id}`)}
          >
            <div className="order-card-header">
              <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status.replace("_", " ")}
              </span>
            </div>

            <div className="order-items-preview">
              {order.items.slice(0, 3).map((item, idx) => (
                <span key={idx} className="order-item-name">
                  {item.name} × {item.quantity}
                  {idx < Math.min(order.items.length, 3) - 1 ? ", " : ""}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="order-item-name"> +{order.items.length - 3} more</span>
              )}
            </div>

            <div className="order-card-footer">
              <span className="order-total">₹{order.totalAmount.toLocaleString()}</span>
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;
