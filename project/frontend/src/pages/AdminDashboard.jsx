import { useEffect, useState } from "react";
import { getRegulatorApplications, approveRegulator, rejectRegulator } from "../api/client";

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionResult, setActionResult] = useState(null);

  const loadApplications = () => {
    setLoading(true);
    getRegulatorApplications()
      .then(setApps)
      .catch(() => setError("Failed to load regulator applications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (appId) => {
    setError("");
    setActionResult(null);
    try {
      const res = await approveRegulator(appId);
      setActionResult({
        type: "success",
        message: `Regulator approved successfully! Account details generated below:`,
        details: res.regulator,
      });
      loadApplications();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve application");
    }
  };

  const handleReject = async (appId) => {
    setError("");
    setActionResult(null);
    try {
      await rejectRegulator(appId);
      setActionResult({
        type: "info",
        message: "Application rejected successfully.",
      });
      loadApplications();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject application");
    }
  };

  const futureFeatures = [
    "Manage Crop Rules (Minimum Yield, Max Pesticide limits)",
    "Manage Fair-Price Ranges across different regions",
    "Manage Organic Threshold parameters for ZK verification",
    "Multi-chain deployment verifier tracking dashboard",
  ];

  return (
    <div className="space-y-8">
      {/* Admin Title */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-sm text-slate-500">
          Logged in as: <span className="font-semibold text-slate-700">Administrator</span>
        </p>
      </section>

      {/* Action Notifications */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionResult && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            actionResult.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-850"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="font-semibold">{actionResult.message}</p>
          {actionResult.details && (
            <div className="mt-2 rounded bg-white border border-emerald-100 p-3 font-mono text-xs text-slate-800 space-y-1">
              <p>Name: {actionResult.details.name}</p>
              <p>Email: {actionResult.details.email}</p>
              <p className="text-emerald-700 font-bold">Regulator ID: {actionResult.details.regulatorId}</p>
              <p className="text-amber-700 font-bold">Temp Password: {actionResult.details.temporaryPassword}</p>
            </div>
          )}
        </div>
      )}

      {/* Applications Section */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800">Regulator Applications</h3>
          <button
            onClick={loadApplications}
            className="rounded-lg border border-agri-250 px-3 py-1.5 text-xs font-semibold text-agri-700 hover:bg-agri-50 transition"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading applications...</p>}

        {!loading && apps.length === 0 && (
          <p className="text-sm text-slate-500">No applications registered in the system.</p>
        )}

        {!loading && apps.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="px-3 py-2">Candidate Details</th>
                  <th className="px-3 py-2">Organization</th>
                  <th className="px-3 py-2">Official Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-800">{app.name}</div>
                      <div className="text-xs text-slate-500">{app.designation} ({app.department})</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{app.organization}</td>
                    <td className="px-3 py-3 text-slate-600 font-mono text-xs">{app.officialEmail}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          app.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {app.status === "Pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(app._id)}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            className="rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-650 hover:bg-red-100 border border-red-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Future Responsibilities Placeholder */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
          Future Administrator Features
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {futureFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <span className="text-agri-600 font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
