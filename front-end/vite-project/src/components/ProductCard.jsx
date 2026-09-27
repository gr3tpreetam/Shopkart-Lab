import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

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

        <button
          className="view-details-btn"
          onClick={() => navigate("/products/" + product._id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
