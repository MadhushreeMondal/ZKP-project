import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/client";

export default function Login() {
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminId: "",
    phone: "",
    pmKisanIdOrAadhaar: "",
    regulatorId: "",
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

    // Build payload according to role requirements
    let payload = { role, password: formData.password };
    if (role === "admin") {
      payload.adminId = formData.adminId;
      payload.email = formData.email;
    } else if (role === "farmer") {
      payload.pmKisanIdOrAadhaar = formData.pmKisanIdOrAadhaar;
      payload.phone = formData.phone;
    } else if (role === "regulator") {
      payload.regulatorId = formData.regulatorId;
      payload.email = formData.email;
    } else if (role === "customer") {
      payload.email = formData.email;
      payload.phone = formData.phone;
    }

    try {
      const res = await loginUser(payload);
      login(res.token, res.user);
      
      // Navigate based on role
      if (res.user.role === "admin") {
        navigate("/admin");
      } else if (res.user.role === "farmer") {
        navigate("/farmer");
      } else if (res.user.role === "regulator") {
        navigate("/regulator");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "farmer", name: "Farmer" },
    { id: "customer", name: "Customer" },
    { id: "regulator", name: "Regulator" },
    { id: "admin", name: "Admin" },
  ];

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to your Agri ZKP account</p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRoleChange(r.id)}
              className={`w-full rounded-md py-2 text-xs font-semibold transition ${
                role === r.id
                  ? "bg-white text-agri-800 shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin ID / Regulator ID (Role specific) */}
          {role === "admin" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Admin ID</label>
              <input
                type="text"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                required
                placeholder="e.g. ADM2026001"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          )}

          {role === "regulator" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Regulator ID</label>
              <input
                type="text"
                name="regulatorId"
                value={formData.regulatorId}
                onChange={handleChange}
                required
                placeholder="e.g. REG-2026-1234"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          )}

          {/* PM-KISAN ID OR Aadhaar Number (Farmer specific) */}
          {role === "farmer" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                PM-KISAN ID or Aadhaar Number
              </label>
              <input
                type="text"
                name="pmKisanIdOrAadhaar"
                value={formData.pmKisanIdOrAadhaar}
                onChange={handleChange}
                required
                placeholder="Enter PM-KISAN ID or 12-digit Aadhaar"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          )}

          {/* Email (Common for Admin, Regulator, Customer) */}
          {role !== "farmer" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {role === "regulator" ? "Official Email Address" : "Email Address"}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@domain.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          )}

          {/* Phone Number (Farmer & Customer specific) */}
          {(role === "farmer" || role === "customer") && (
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
          )}

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-agri-600 px-4 py-2.5 font-semibold text-white transition hover:bg-agri-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "Signing in..." : `Sign in as ${roles.find((r) => r.id === role).name}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 space-y-1">
          {role !== "admin" && role !== "regulator" && (
            <p>
              New user?{" "}
              <Link to="/register" className="font-semibold text-agri-600 hover:text-agri-750">
                Create an account
              </Link>
            </p>
          )}
          {role === "regulator" && (
            <p>
              Need onboarding?{" "}
              <Link to="/apply" className="font-semibold text-agri-600 hover:text-agri-750">
                Apply as a Regulator
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
