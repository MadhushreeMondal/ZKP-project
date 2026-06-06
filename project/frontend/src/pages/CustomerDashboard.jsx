import { useState } from "react";

export default function CustomerDashboard() {
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!batchId) return;

    // Phase 1 Mock Verification response
    setResult({
      batchId: batchId.toUpperCase(),
      crop: "Wheat",
      organicStatus: "✅ Verified Organic (Pesticide safe)",
      fairPriceStatus: "✅ Verified Fair Trade (Ethical range)",
      blockchainStatus: "✅ Verified on Hardhat Ethereum Testnet",
      txHash: "0x3bc72b9a7b97e937d5635f6f40449cf9efd06587c67bfb809d84fde90784ad32",
      verificationDate: new Date().toLocaleDateString(),
    });
  };

  const futureFeatures = [
    { name: "Search Crop Batch ID", desc: "Instantly lookup compliance metrics by agricultural batch ID." },
    { name: "Scan Crop QR Code", desc: "Scan physical product QR labels in grocery outlets for mobile validation." },
    { name: "Verify Organic status", desc: "Proof of non-toxic cultivation without exposing exact pesticide volumes." },
    { name: "Verify Fair-Price status", desc: "Proof of ethical trade margins without exposing exact purchase agreements." },
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Customer Dashboard</h2>
        <p className="text-sm text-slate-500">
          Verify product authenticity, fair price standards, and organic certification transparently.
        </p>
      </section>

      {/* Main Interactive Demo & Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mock Search Tool */}
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Search Batch ID</h3>
          <p className="text-xs text-slate-500">
            Try entering a sample batch ID like <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-semibold text-slate-700">BHD2026001</span> to run a mock query.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g. BHD2026001"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-agri-500 focus:outline-none focus:ring-2 focus:ring-agri-200 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-agri-600 px-4 py-2 text-sm font-semibold text-white hover:bg-agri-700 transition"
            >
              Search
            </button>
          </form>

          {result && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3 text-sm text-slate-700">
              <div className="flex justify-between border-b border-emerald-150 pb-2">
                <span className="font-bold text-slate-850">Batch: {result.batchId}</span>
                <span className="text-xs font-semibold text-slate-500">Crop: {result.crop}</span>
              </div>
              <div className="space-y-1">
                <p>{result.organicStatus}</p>
                <p>{result.fairPriceStatus}</p>
                <p>{result.blockchainStatus}</p>
              </div>
              <div className="text-xs text-slate-500 pt-1 border-t border-emerald-150 space-y-1">
                <p className="break-all">Tx Hash: {result.txHash}</p>
                <p>Checked on: {result.verificationDate}</p>
              </div>
            </div>
          )}
        </section>

        {/* Scan QR Code Mock Interface */}
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Scan QR Code</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Future support for instant mobile phone scanner interface, allowing consumers to scan QR stickers physically attached to packaging.
            </p>
          </div>
          <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-350 hover:bg-slate-100 transition cursor-pointer">
            <div className="flex flex-col items-center">
              <span className="text-3xl">📷</span>
              <span className="text-2xs font-semibold text-slate-500 mt-1">Open Camera</span>
            </div>
          </div>
          <p className="text-2xs text-slate-400">Powered by Agri ZKP verification protocol</p>
        </section>
      </div>

      {/* Privacy Notice */}
      <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm space-y-2">
        <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
          🔒 Zero-Knowledge Privacy Enforcement
        </h4>
        <p className="text-xs text-amber-700 leading-relaxed">
          Customer dashboards can only verify final compliance states (Organic status, Fair Trade price status, Blockchain execution receipt). Private farmer parameters, including **Yield size, Pesticide volume, Inventory storage, and personal farmer records**, are cryptographically hidden and never exposed to the public.
        </p>
      </section>

      {/* Future Architectures */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
          Future Customer Features Scope
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {futureFeatures.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-1">
              <h4 className="text-sm font-bold text-slate-700">{f.name}</h4>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
