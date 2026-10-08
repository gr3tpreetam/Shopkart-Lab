import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  // Wishlist state
  const [wishlistStatus, setWishlistStatus] = useState("idle"); // idle | loading | success | error
  const [wishlistError, setWishlistError] = useState("");

  // Cart state
  const [cartStatus, setCartStatus] = useState("idle"); // idle | loading | success | error
  const [cartError, setCartError] = useState("");

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "loading" || wishlistStatus === "success") return;
    setWishlistStatus("loading");
    setWishlistError("");

    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistStatus("success");
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to save product.";
      if (err.response?.status === 409) {
        setWishlistStatus("success"); // Already in wishlist — treat as success
      } else {
        setWishlistStatus("error");
        setWishlistError(msg);
      }
    }
  };

  const handleAddToCart = async () => {
    if (cartStatus === "loading") return;
    setCartStatus("loading");
    setCartError("");

    try {
      await api.post(`/cart/${product._id}`);
      await fetchCart(); // sync global cart state
      setCartStatus("success");
      setTimeout(() => setCartStatus("idle"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to add to cart.";
      setCartStatus("error");
      setCartError(msg);
      setTimeout(() => setCartStatus("idle"), 2000);
    }
  };

  const wishlistLabel =
    wishlistStatus === "loading"
      ? "⏳ Saving..."
      : wishlistStatus === "success"
      ? "♥ Wishlisted"
      : "♡ Wishlist";

  const cartLabel =
    cartStatus === "loading"
      ? "Adding..."
      : cartStatus === "success"
      ? "✓ Added!"
      : "Add to Cart";

  return (
    <div className="product-card">
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
            ? product.stock + " units left"
            : "Out of stock"}
        </p>

        <div className="card-actions">
          <button
            className="view-details-btn"
            onClick={() => navigate("/products/" + product._id)}
          >
            View Details
          </button>

          <button
            className={`wishlist-btn${wishlistStatus === "success" ? " wishlisted" : ""}`}
            onClick={handleAddToWishlist}
            disabled={wishlistStatus === "loading" || wishlistStatus === "success"}
          >
            {wishlistLabel}
          </button>
        </div>

        {/* Add to Cart — full-width below */}
        <button
          className="add-to-cart-btn-card"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || cartStatus === "loading"}
        >
          {product.stock === 0 ? "Out of Stock" : cartLabel}
        </button>

        {wishlistStatus === "error" && (
          <p className="card-error">{wishlistError}</p>
        )}
        {cartStatus === "error" && (
          <p className="card-error">{cartError}</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
