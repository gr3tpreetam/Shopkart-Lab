import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const INITIAL_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!address.fullName.trim()) errors.fullName = "Full name is required.";
    if (!address.phone.trim()) {
      errors.phone = "Phone is required.";
    } else if (!/^\d{10}$/.test(address.phone.trim())) {
      errors.phone = "Phone must be a 10-digit number.";
    }
    if (!address.addressLine1.trim()) errors.addressLine1 = "Address is required.";
    if (!address.city.trim()) errors.city = "City is required.";
    if (!address.state.trim()) errors.state = "State is required.";
    if (!address.pincode.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(address.pincode.trim())) {
      errors.pincode = "Pincode must contain 6 digits.";
    }
    return errors;
  };

  const handlePlaceOrder = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      // Step 1: Create payment order on server
      const res = await api.post("/orders/create-payment-order", {
        shippingAddress: address,
      });

      const { razorpayOrderId, amount, currency, keyId, orderId } = res.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "ShopKart",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on server
            const verifyRes = await api.post("/orders/verify-payment", {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              clearCart(); // Clear global cart
              navigate(`/orders/${verifyRes.data.order._id}`, {
                state: { confirmed: true },
              });
            }
          } catch (err) {
            setServerError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: { color: "#222" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        setServerError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="products-page">
        <div className="state-message">
          <p>Your cart is empty. <button className="btn-link" onClick={() => navigate("/products")}>Browse Products</button></p>
        </div>
      </div>
    );
  }

  const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma" },
    { name: "phone", label: "Phone Number", placeholder: "9876543210" },
    { name: "addressLine1", label: "Address", placeholder: "22 MG Road" },
    { name: "city", label: "City", placeholder: "Bengaluru" },
    { name: "state", label: "State", placeholder: "Karnataka" },
    { name: "pincode", label: "Pincode", placeholder: "560001" },
  ];

  return (
    <div className="checkout-page">
      <h1 className="products-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Shipping form */}
        <div className="shipping-form-box">
          <h2>Shipping Details</h2>

          {fields.map(({ name, label, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <input
                className={"form-input" + (fieldErrors[name] ? " input-error" : "")}
                name={name}
                placeholder={placeholder}
                value={address[name]}
                onChange={handleChange}
              />
              {fieldErrors[name] && (
                <p className="field-error">{fieldErrors[name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div className="summary-divider" />
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>

          {serverError && (
            <p className="card-error" style={{ marginTop: "12px" }}>
              {serverError}
            </p>
          )}

          <button
            className="btn-primary checkout-btn"
            onClick={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
