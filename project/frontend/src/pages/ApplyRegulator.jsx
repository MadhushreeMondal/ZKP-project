import { useState } from "react";
import { Link } from "react-router-dom";
import { applyRegulator } from "../api/client";

export default function ApplyRegulator() {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    organization: "",
    officialEmail: "",
    phone: "",
    governmentId: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await applyRegulator(formData);
      setSuccess(true);
      setFormData({
        name: "",
        department: "",
        organization: "",
        officialEmail: "",
        phone: "",
        governmentId: "",
        designation: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">Apply as Regulator</h2>
          <p className="text-sm text-slate-500">
            Submit your credentials to gain access to compliance dashboards.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-2">
            <p className="font-semibold">Application Submitted Successfully!</p>
            <p>
              Your request is now pending review. The administrator will approve your request and generate your unique Regulator ID and Temporary Password.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Inspector Alice"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g. Quality Standards"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                placeholder="e.g. Quality Officer"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
              placeholder="e.g. Agricultural Standards Board"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Official Email</label>
            <input
              type="email"
              name="officialEmail"
              value={formData.officialEmail}
              onChange={handleChange}
              required
              placeholder="official@board.gov"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Government ID Number</label>
              <input
                type="text"
                name="governmentId"
                value={formData.governmentId}
                onChange={handleChange}
                required
                placeholder="ID-8927189"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-agri-600 px-4 py-2.5 font-semibold text-white transition hover:bg-agri-700 disabled:opacity-60 shadow-sm"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <p>
            Already approved?{" "}
            <Link to="/login" className="font-semibold text-agri-600 hover:text-agri-750">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
