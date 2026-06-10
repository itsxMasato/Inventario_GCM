import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../lib/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login({ username, password });
      // Redirigir a welcome screen con animación
      navigate('/welcome')
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/60 pointer-events-none"></div>

      <main className="relative w-full max-w-[900px] mx-4 lg:mx-0 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Left: visual / brand */}
        <section className="hidden lg:flex flex-col items-start justify-center bg-corp-navy text-white rounded-xl p-10 h-[560px] shadow-xl">
          <div className="mb-6">
            {showLogo ? (
              <img
                src={logoSrc}
                alt="GCM Logo"
                className="w-24 h-24 object-contain bg-white/5 p-2 rounded-lg"
                onError={() => {
                  if (logoSrc === "/logo.png") setLogoSrc("/logo.jpg");
                  else setShowLogo(false);
                }}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-white/5 rounded-lg text-sm font-semibold">
                GCM
              </div>
            )}
          </div>
          <h2 className="text-3xl font-semibold">Inventario GCM</h2>
          <p className="mt-3 text-sm text-white/80 max-w-xs">
            Sistema centralizado de inventario y logística. Accede con tu cuenta
            para gestionar operaciones.
          </p>
        </section>

        {/* Right: form */}
        <section className="bg-white rounded-xl p-8 shadow-xl">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-corp-navy">
              Iniciar sesión
            </h1>
            <p className="text-sm text-slate-500">
              Introduce tus credenciales para acceder al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-rose-600">{error}</div>}

            <label className="block">
              <div className="text-sm text-slate-600 mb-1">Usuario</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-corp-navy/20 focus:border-corp-navy"
                placeholder="usuario"
                required
              />
            </label>

            <label className="block">
              <div className="text-sm text-slate-600 mb-1">Contraseña</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-corp-navy/20 focus:border-corp-navy"
                placeholder="••••••••"
                required
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="w-4 h-4" />
                Recordarme
              </label>
              <button
                type="button"
                className="text-sm text-corp-navy hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-shrimp-red text-white font-medium hover:brightness-95 disabled:opacity-70"
            >
              {loading ? "Procesando..." : "Acceder al Sistema"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4">
            Credenciales demo: <strong>admin / admin123</strong>
          </p>
        </section>
      </main>
    </div>
  );
}
