import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Hide navbar on login and register pages
  const hiddenPaths = ["/login", "/register", "/"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">
        ShopKart
      </Link>

      <div className="nav-links">
        <Link
          to="/home"
          className={
            "nav-link" +
            (location.pathname === "/home" ? " active" : "")
          }
        >
          Home
        </Link>

        <Link
          to="/products"
          className={
            "nav-link" +
            (location.pathname.startsWith("/products") ? " active" : "")
          }
        >
          Products
        </Link>

        {/* Lab 4 — Wishlist */}
        <Link
          to="/wishlist"
          className={
            "nav-link" +
            (location.pathname === "/wishlist" ? " active" : "")
          }
        >
          Wishlist
        </Link>

        {/* Lab 5 — Cart with item count badge */}
        <Link
          to="/cart"
          className={
            "nav-link" +
            (location.pathname === "/cart" ? " active" : "")
          }
          style={{ position: "relative" }}
        >
          Cart
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>

        {/* Lab 6 — My Orders */}
        <Link
          to="/orders"
          className={
            "nav-link" +
            (location.pathname.startsWith("/orders") ? " active" : "")
          }
        >
          Orders
        </Link>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;