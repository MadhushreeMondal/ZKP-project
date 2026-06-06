import { useEffect, useState } from "react";
import { getCrops, getCropRules, submitCompliance } from "../api/client";
import RulesPanel from "../components/RulesPanel";

const initialForm = {
  crop: "",
  yield: "",
  temperature: "",
  inventory: "",
  pesticide: "",
  price: "",
};

export default function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [rules, setRules] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCrops()
      .then(setCrops)
      .catch(() => setError("Failed to load crops"));
  }, []);

  useEffect(() => {
    if (!form.crop) {
      setRules(null);
      return;
    }
    getCropRules(form.crop)
      .then(setRules)
      .catch((err) => setError(err.response?.data?.error || "Failed to load rules"));
  }, [form.crop]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await submitCompliance({
        crop: form.crop,
        yield: Number(form.yield),
        temperature: Number(form.temperature),
        inventory: Number(form.inventory),
        pesticide: Number(form.pesticide),
        price: Number(form.price),
      });
      setResult(response.record);
      setForm((prev) => ({ ...initialForm, crop: prev.crop }));
    } catch (err) {
      const details = err.response?.data?.details;
      setError(
        details
          ? details.join("; ")
          : err.response?.data?.error || "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-2xl font-bold text-slate-800">
          Farmer Dashboard
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Submit crop data privately. Only a ZK proof hash and verification
          status are stored on-chain.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Select Crop
            </label>
            <select
              name="crop"
              value={form.crop}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
            >
              <option value="">Choose a crop...</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          {[
            { name: "yield", label: "Yield" },
            { name: "temperature", label: "Temperature (°C)" },
            { name: "inventory", label: "Inventory" },
            { name: "pesticide", label: "Pesticide" },
            { name: "price", label: "Price (₹)" },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {field.label}
              </label>
              <input
                type="number"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                step="any"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || !form.crop}
            className="w-full rounded-lg bg-agri-600 px-4 py-3 font-semibold text-white transition hover:bg-agri-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating ZK Proof..." : "Submit & Verify Compliance"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">Proof submitted successfully</p>
            <p className="mt-1">Crop: {result.crop}</p>
            <p>Proof Hash: {result.proofHash.slice(0, 24)}...</p>
            <p>
              Verification:{" "}
              {result.verificationResult ? "✅ Verified" : "❌ Failed"}
            </p>
            {result.txHash && (
              <p className="mt-1 break-all">Tx: {result.txHash}</p>
            )}
          </div>
        )}
      </section>

      <RulesPanel rules={rules} />
    </div>
  );
}
