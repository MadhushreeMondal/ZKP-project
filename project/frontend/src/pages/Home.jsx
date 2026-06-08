import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto py-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Secure, Private & Trustworthy
          <span className="block text-agri-600 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Agricultural Compliance
          </span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Leveraging Zero-Knowledge Proofs (ZKP) and multi-chain blockchain technology, Agri ZKP enables farmers to prove regulatory compliance without exposing sensitive business intelligence.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="rounded-xl bg-agri-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-agri-700 hover:shadow-lg transition-all duration-200"
          >
            Access Platform
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all duration-200"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Core Features
          </h2>
          <p className="text-slate-500">
            Designed for privacy, scalability, and absolute verification.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-agri-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🔒
            </div>
            <h3 className="text-xl font-semibold text-slate-850">Complete Privacy</h3>
            <p className="text-sm text-slate-650 leading-relaxed">
              Zero-Knowledge Proofs (ZKP) ensure that sensitive private variables like yield volumes and pesticide counts are never stored on the public blockchain.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-agri-600 rounded-xl flex items-center justify-center text-xl font-bold">
              ⛓️
            </div>
            <h3 className="text-xl font-semibold text-slate-850">Smart Contract Verifiable</h3>
            <p className="text-sm text-slate-650 leading-relaxed">
              Generated proofs are submitted to Ethereum smart contracts where verification occurs automatically on-chain without any human intervention or bias.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-agri-600 rounded-xl flex items-center justify-center text-xl font-bold">
              🏷️
            </div>
            <h3 className="text-xl font-semibold text-slate-850">Consumer Transparency</h3>
            <p className="text-sm text-slate-650 leading-relaxed">
              Customers can scan product Product IDs to verify organic status and fair-price compliance instantly, without accessing proprietary farming parameters.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-900 to-green-950 text-white p-8 sm:p-12 shadow-xl space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-emerald-100">
            How It Works
          </h2>
          <p className="text-emerald-300">
            The flow of secure agricultural data verification.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3 relative">
            <div className="text-4xl font-extrabold text-emerald-400">01.</div>
            <h3 className="text-lg font-semibold text-white">Input Data</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Farmers enter local records (yield, pesticide quantity, temperature, price) privately into the local client dashboard.
            </p>
          </div>
          <div className="space-y-3 relative">
            <div className="text-4xl font-extrabold text-emerald-400">02.</div>
            <h3 className="text-lg font-semibold text-white">Generate ZK Proof</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              The dashboard compiles details and uses local witness engines to generate a Groth16 zk-SNARK cryptographic compliance proof.
            </p>
          </div>
          <div className="space-y-3 relative">
            <div className="text-4xl font-extrabold text-emerald-400">03.</div>
            <h3 className="text-lg font-semibold text-white">On-Chain Validation</h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              The proof hash is sent on-chain to our smart contract, making it universally verifiable for regulators and consumers alike.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-4xl mx-auto text-center space-y-6 py-6 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">About the Platform</h2>
        <p className="text-slate-600 leading-relaxed text-sm">
          Agri ZKP bridges the gap between strict government regulations, fair trade compliance, and competitive farmers. By decoupling proof of compliance from disclosure of agricultural methods, we empower sustainable farming practices, guarantee quality metrics to consumers, and establish high-speed, verifiable trade registries.
        </p>
      </section>
    </div>
  );
}
