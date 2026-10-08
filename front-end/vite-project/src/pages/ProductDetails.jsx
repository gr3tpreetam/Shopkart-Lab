import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cart state
  const [cartStatus, setCartStatus] = useState("idle");
  const [cartError, setCartError] = useState("");

  // Wishlist state
  const [wishlistStatus, setWishlistStatus] = useState("idle");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/products/" + id);
        setProduct(response.data.product);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Product not found.");
        } else if (err.response?.status === 400) {
          setError("Invalid product ID.");
        } else {
          setError("Something went wrong while loading the product.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (cartStatus === "loading") return;
    setCartStatus("loading");
    setCartError("");
    try {
      await api.post(`/cart/${id}`);
      await fetchCart();
      setCartStatus("success");
      setTimeout(() => setCartStatus("idle"), 1500);
    } catch (err) {
      setCartError(err.response?.data?.message || "Unable to add to cart.");
      setCartStatus("error");
      setTimeout(() => setCartStatus("idle"), 2000);
    }
  };

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "loading" || wishlistStatus === "success") return;
    setWishlistStatus("loading");
    try {
      await api.post(`/wishlist/${id}`);
      setWishlistStatus("success");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishlistStatus("success");
      } else {
        setWishlistStatus("idle");
      }
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="state-message"><p>Loading product...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="state-message error"><p>{error}</p></div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button className="back-btn" onClick={() => navigate("/products")}>
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const cartLabel =
    cartStatus === "loading" ? "Adding..." :
    cartStatus === "success" ? "✓ Added to Cart!" :
    product.stock === 0 ? "Out of Stock" : "Add to Cart";

  const wishlistLabel =
    wishlistStatus === "loading" ? "⏳ Saving..." :
    wishlistStatus === "success" ? "♥ Wishlisted" : "♡ Add to Wishlist";

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div className="detail-card">
        <div className="detail-image-container">
          <img src={product.image} alt={product.name} className="detail-image" />
        </div>

        <div className="detail-info">
          <h1 className="detail-name">{product.name}</h1>
          <span className="detail-category">{product.category}</span>
          <p className="detail-price">₹{product.price.toLocaleString()}</p>
          <p className="detail-description">{product.description}</p>
          <p className="detail-stock">
            {product.stock > 0
              ? "In Stock — " + product.stock + " units available"
              : "Out of Stock"}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
            <button
              className="add-to-cart-btn"
              disabled={product.stock === 0 || cartStatus === "loading"}
              onClick={handleAddToCart}
            >
              {cartLabel}
            </button>

            <button
              className={`wishlist-btn${wishlistStatus === "success" ? " wishlisted" : ""}`}
              disabled={wishlistStatus === "loading" || wishlistStatus === "success"}
              onClick={handleAddToWishlist}
            >
              {wishlistLabel}
            </button>
          </div>

          {cartStatus === "error" && (
            <p className="card-error">{cartError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
