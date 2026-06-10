import React from 'react'

export default function Reportes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-corp-navy">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19h16" />
            <path d="M8 14v5" />
            <path d="M12 10v9" />
            <path d="M16 6v13" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-corp-navy">Reportes</h2>
          <p className="text-sm text-slate-500">Generación de reportes e informes.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Aquí irán los reportes de inventario, entradas y salidas, y métricas clave.</p>
      </div>
    </div>
  )
}
