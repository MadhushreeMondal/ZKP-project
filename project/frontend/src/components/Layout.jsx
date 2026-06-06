import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const navLink = (path, label) => {
    const active = location.pathname === path;
    return (
      <Link
        to={path}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          active
            ? "bg-agri-600 text-white"
            : "text-slate-600 hover:bg-agri-50 hover:text-agri-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-agri-800">
              Agri ZKP Privacy Layer
            </h1>
            <p className="text-xs text-slate-500">
              Zero-Knowledge Compliance for Multi-Chain Agricultural Systems
            </p>
          </div>
          <nav className="flex gap-2">
            {navLink("/", "Farmer Dashboard")}
            {navLink("/regulator", "Regulator Dashboard")}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
