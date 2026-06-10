import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const productos = {
  'CRM-001': {
    id: 'CRM-001',
    name: 'Motor Industrial Síncrono',
    title: 'Historial de Motor Industrial Síncrono',
    description: 'Registro detallado de todos los movimientos y cambios de estado del activo.',
    history: [
      { date: '2026-02-25', status: 'Activo', location: 'Planta 3 - Sector A', note: 'Revisión completa finalizada' },
      { date: '2026-02-10', status: 'En Traslado', location: 'Logística Central', note: 'Traslado de planta' },
      { date: '2026-01-30', status: 'En Revisión', location: 'Taller AQ1', note: 'Chequeo de vibraciones' },
      { date: '2026-01-27', status: 'En Revisión', location: 'Oficina Principal', note: 'Inspección inicial' },
      { date: '2026-01-22', status: 'En Traslado', location: 'Logística Central', note: 'Preparado para revisión' },
      { date: '2026-01-18', status: 'Dañado', location: 'Planta 3', note: 'Falla detectada en bobinado' },
      { date: '2026-01-15', status: 'Activo', location: 'Planta 3', note: 'Puesta en servicio tras reparación' },
    ],
  },
}

const statusClasses = {
  Activo: 'bg-emerald-100 text-emerald-700',
  'En Traslado': 'bg-orange-100 text-orange-700',
  'En Revisión': 'bg-red-100 text-red-700',
  Dañado: 'bg-yellow-100 text-yellow-700',
}

export default function HistorialProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const producto = productos[id]

  if (!producto) {
    return (
      <div className="mt-16 p-6">
        <h1 className="text-3xl font-semibold text-corp-navy">Producto no encontrado</h1>
        <p className="mt-3 text-slate-600">El historial solicitado no existe o el ID es incorrecto.</p>
      </div>
    )
  }

  return (
    <div className="mt-16 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-corp-navy">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19h16" />
                <path d="M8 15v4" />
                <path d="M12 11v8" />
                <path d="M16 7v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Movimientos / Historial</p>
              <h1 className="text-3xl font-semibold text-corp-navy">{producto.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{producto.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/movimientos')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Volver a Movimientos
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-corp-navy">Historial de movimientos</h2>
            <p className="text-sm text-slate-500">Últimos eventos registrados para este producto.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Código:</span> {producto.id}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-500">
                <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Fecha</th>
                <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Estado</th>
                <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Ubicación</th>
                <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {producto.history.map((event) => (
                <tr key={event.date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-700">{new Date(event.date).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusClasses[event.status]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{event.location}</td>
                  <td className="px-6 py-4 text-slate-700">{event.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
