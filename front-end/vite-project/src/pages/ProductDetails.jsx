import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="detail-page">
        <div className="state-message">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="state-message error">
          <p>{error}</p>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className="back-btn"
            onClick={() => navigate("/products")}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="detail-page">
      <button
        className="back-btn"
        onClick={() => navigate("/products")}
      >
        ← Back to Products
      </button>

      <div className="detail-card">
        <div className="detail-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="detail-image"
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-name">{product.name}</h1>

          <span className="detail-category">{product.category}</span>

          <p className="detail-price">
            ₹{product.price.toLocaleString()}
          </p>

          <p className="detail-description">{product.description}</p>

          <p className="detail-stock">
            {product.stock > 0
              ? "In Stock — " + product.stock + " units available"
              : "Out of Stock"}
          </p>

          <button
            className="add-to-cart-btn"
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
