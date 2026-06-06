import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/client";

export default function Register() {
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    pmKisanId: "",
    aadhaarNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
      role,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    if (role === "farmer") {
      payload.pmKisanId = formData.pmKisanId;
      payload.aadhaarNumber = formData.aadhaarNumber;
      // Backend expects email for farmers too (schema has email required/unique).
      // Since it's a required field in Mongoose Schema, we'll assign a placeholder or collect it.
      // Collecting a valid email is a best practice to ensure unique accounts. Let's add email field for farmers as well.
      payload.email = formData.email || `${formData.pmKisanId}@kisan.com`;
    }

    try {
      const res = await registerUser(payload);
      login(res.token, res.user);
      
      if (res.user.role === "farmer") {
        navigate("/farmer");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="text-sm text-slate-500">Register as a platform member</p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => handleRoleChange("farmer")}
            className={`w-full rounded-md py-2 text-xs font-semibold transition ${
              role === "farmer"
                ? "bg-white text-agri-800 shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Farmer
          </button>
          <button
            onClick={() => handleRoleChange("customer")}
            className={`w-full rounded-md py-2 text-xs font-semibold transition ${
              role === "customer"
                ? "bg-white text-agri-800 shadow"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Customer
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          {/* Email (Always collected to satisfy DB uniqueness rules) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          {/* Farmer Fields */}
          {role === "farmer" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">PM-KISAN ID</label>
                <input
                  type="text"
                  name="pmKisanId"
                  value={formData.pmKisanId}
                  onChange={handleChange}
                  required
                  placeholder="Enter PM-KISAN ID"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                  placeholder="12-digit Aadhaar Number"
                  maxLength={12}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
                />
              </div>
            </>
          )}

          {/* Phone Number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="e.g. +91 9876543210"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-agri-600 px-4 py-2.5 font-semibold text-white transition hover:bg-agri-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "Registering..." : `Register as ${role === "farmer" ? "Farmer" : "Customer"}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-agri-600 hover:text-agri-750">
              Sign in
            </Link>
          </p>
          <p className="pt-2 border-t border-slate-100">
            Regulators cannot register directly.{" "}
            <Link to="/apply" className="font-semibold text-agri-600 hover:text-agri-750 block mt-1">
              Apply as a Regulator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
