import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Settings() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/customers/me");
        setFormData((prev) => ({ ...prev, fullName: res.data.fullName }));
      } catch (err) {
        setError("Could not load your profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage(""); // clear previous messages
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setUpdating(true);

    try {
      const payload = {};
      if (formData.fullName.trim()) payload.fullName = formData.fullName;
      if (formData.password) payload.password = formData.password;

      if (Object.keys(payload).length === 0) {
        setError("Nothing to update.");
        setUpdating(false);
        return;
      }

      await api.put("/customers/settings", payload);
      setMessage("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="state-message"><p>Loading settings...</p></div>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ maxWidth: "600px" }}>
      <h1 className="products-title">Account Settings</h1>

      <div className="shipping-form-box">
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Update your profile details below. Leave password blank if you don't want to change it.
        </p>

        {message && (
          <div style={{ padding: "12px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", marginBottom: "20px" }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: "12px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep unchanged"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", marginTop: "12px" }}
            disabled={updating}
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
