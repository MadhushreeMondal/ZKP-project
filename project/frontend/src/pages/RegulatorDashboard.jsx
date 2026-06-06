import { useEffect, useState } from "react";
import { getRegulatorRecords } from "../api/client";

export default function RegulatorDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = () => {
    setLoading(true);
    getRegulatorRecords()
      .then(setRecords)
      .catch(() => setError("Failed to load verification records"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
    const interval = setInterval(loadRecords, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Regulator Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Verification status only — private farmer values are never revealed.
          </p>
        </div>
        <button
          onClick={loadRecords}
          className="rounded-lg border border-agri-200 px-4 py-2 text-sm font-medium text-agri-700 hover:bg-agri-50"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-slate-500">Loading records...</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && records.length === 0 && (
        <p className="text-slate-500">No compliance records yet.</p>
      )}

      {!loading && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-3">Crop</th>
                <th className="px-3 py-3">Proof Hash</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr
                  key={`${record.proofHash}-${idx}`}
                  className="border-b border-slate-100 hover:bg-emerald-50/50"
                >
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {record.crop}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">
                    {record.proofHash.slice(0, 16)}...
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.verificationResult
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.verificationResult ? "Verified" : "Failed"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">
                    {record.txHash ? `${record.txHash.slice(0, 12)}...` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
