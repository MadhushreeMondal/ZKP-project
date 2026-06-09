import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyProduct } from "../api/client";

export default function CustomerDashboard() {
const [productId, setProductId] = useState("");
const [result, setResult] = useState(null);

useEffect(() => {
  let scanner;
  scanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: 250,
    },
    false
  );

scanner.render(
  async (decodedText) => {
    try {
      let scannedProductId = decodedText.trim();

      // Extract Product ID from URL QR
     if (scannedProductId.includes("/verify/")) {
  scannedProductId =
    scannedProductId
      .split("/verify/")[1]
      .split("?")[0];
}

      setProductId(scannedProductId);

      const data =
        await verifyProduct(scannedProductId);

      setResult(data);

      // Stop scanner after successful scan
      setTimeout(() => {
  scanner.clear().catch(() => {});
}, 500);
    } catch (error) {
      console.error(error);
      alert("Product not found");
      setResult(null);
    }
  },
  () => {}
);

return () => {
  if (scanner) {
    setTimeout(() => {
  scanner.clear().catch(() => {});
}, 500);
  }
};
}, []);

const handleSearch = async (e) => {
  e.preventDefault();

  if (!productId) return;

  try {
    const cleanedProductId = productId.trim();

const data =
  await verifyProduct(cleanedProductId);
    setResult(data);
  } catch (error) {
    console.error(error);
    alert("Product not found");
    setResult(null);
  }
};

  const futureFeatures = [
    { name: "Search Crop Product ID", desc: "Instantly lookup compliance metrics by agricultural Product ID." },
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
          <h3 className="text-lg font-bold text-slate-800">Search Product ID</h3>
          <p className="text-xs text-slate-500">
            Try entering a sample Product ID like <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-semibold text-slate-700">PRD-243511</span> to run a mock query.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. PRD-243511"
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
    
    <p>
      <strong>Product ID:</strong> {result.productId}
    </p>

    <p>
      <strong>Crop:</strong> {result.crop}
    </p>

    <p>
      <strong>Status:</strong>{" "}
      {result.verificationResult
        ? "✅ VERIFIED"
        : "❌ FAILED"}
    </p>

    <p className="break-all">
      <strong>Proof Hash:</strong>{" "}
      {result.proofHash}
    </p>

    {result.txHash && (
      <p className="break-all">
        <strong>Tx Hash:</strong>{" "}
        {result.txHash}
      </p>
    )}
  </div>
)}

        </section>

        {/* QR Scanner */}
<section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-4">

  <div className="space-y-2">
    <h3 className="text-lg font-bold text-slate-800">
      Scan QR Code
    </h3>

    <p className="text-xs text-slate-500 max-w-sm">
      Scan the QR code printed on the crop package to verify compliance.
    </p>
  </div>

  <div
    id="reader"
    className="w-full max-w-sm"
  ></div>
  {productId && (
  <p className="text-sm text-slate-600">
    Scanned Product:{" "}
    <span className="font-mono">
      {productId}
    </span>
  </p>
)}

  <p className="text-xs text-slate-400">
    Powered by Agri ZKP verification protocol
  </p>

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
