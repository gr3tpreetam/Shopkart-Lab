import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState({}); // { productId: true }

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setRemoving((prev) => ({ ...prev, [productId]: true }));
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setRemoving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="state-message">
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="wishlist-page">
        <div className="state-message error">
          <p>Something went wrong.</p>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="state-message">
          <p style={{ fontSize: "48px", marginBottom: "8px" }}>❤️</p>
          <p style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
            Your wishlist is empty
          </p>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            Save products you love and find them here later.
          </p>
          <button className="btn-primary" onClick={() => navigate("/products")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1 className="products-title">My Wishlist</h1>
      <p style={{ color: "#888", marginBottom: "24px" }}>
        {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
      </p>

      <div className="products-grid">
        {wishlist.map((product) => (
          <div className="product-card" key={product._id}>
            <div className="product-image-container">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <span className="product-category">{product.category}</span>
              <p className="product-price">₹{product.price.toLocaleString()}</p>
              <p className="product-stock">
                {product.stock > 0
                  ? `${product.stock} units left`
                  : "Out of Stock"}
              </p>

              <div className="card-actions">
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  View Details
                </button>

                <button
                  className="wishlist-btn wishlisted"
                  onClick={() => handleRemove(product._id)}
                  disabled={removing[product._id]}
                >
                  {removing[product._id] ? "Removing..." : "♥ Remove"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
