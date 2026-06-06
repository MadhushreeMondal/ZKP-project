import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (path, label) => {
    const active = location.pathname === path;
    return (
      <Link
        to={path}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          active
            ? "bg-agri-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-agri-50 hover:text-agri-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <Link to="/" className="block">
              <h1 className="text-lg font-extrabold tracking-tight text-agri-800">
                Agri ZKP Privacy Layer
              </h1>
              <p className="text-3xs text-slate-500 font-medium">
                Zero-Knowledge Compliance for Agricultural Blockchain Systems
              </p>
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            {/* Public links */}
            {navLink("/", "Home")}

            {/* Unauthenticated Options */}
            {!user && (
              <>
                {navLink("/login", "Login")}
                {navLink("/register", "Register")}
                {navLink("/apply", "Apply")}
              </>
            )}

            {/* Authenticated Dashboard links */}
            {user && (
              <>
                {user.role === "farmer" && navLink("/farmer", "Farmer Dashboard")}
                {user.role === "regulator" && navLink("/regulator", "Regulator Dashboard")}
                {user.role === "admin" && navLink("/admin", "Admin Dashboard")}
                {user.role === "customer" && navLink("/customer", "Customer Dashboard")}
                
                {/* User summary details */}
                <div className="ml-2 border-l border-slate-200 pl-3 flex items-center gap-2">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-800">{user.name}</div>
                    <div className="text-4xs font-bold uppercase tracking-wider text-agri-600">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 hover:border-red-200 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
