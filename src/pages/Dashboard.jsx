import React, { useMemo } from 'react'

const data = [
  { label: 'Lun', e: 120, s: 140 },
  { label: 'Mar', e: 180, s: 160 },
  { label: 'Mié', e: 90,  s: 200 },
  { label: 'Jue', e: 210, s: 190 },
  { label: 'Vie', e: 150, s: 110 },
  { label: 'Sáb', e: 60,  s: 40  },
  { label: 'Dom', e: 30,  s: 20  },
]

export default function Dashboard(){
  const max = useMemo(() => Math.max(...data.flatMap(d => [d.e, d.s])), [])
  const maxH = 180

  return (
    <div className="space-y-6">
      {/* Topbar inside page */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-corp-navy">Dashboard</h2>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-500 bg-gray-50">
            <span>01 / 01 / 2023</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <button className="relative p-2 text-gray-400 hover:text-shrimp-red transition-colors" aria-label="notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-shrimp-red rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 text-sm">
        <button className="px-5 py-2 bg-corp-navy text-white font-medium">Hoy</button>
        <button className="px-5 py-2 bg-white text-gray-600 hover:bg-gray-50 border-l border-gray-200">Ayer</button>
        <button className="px-5 py-2 bg-white text-gray-600 hover:bg-gray-50 border-l border-gray-200">Esta semana</button>
        <button className="px-5 py-2 bg-white text-gray-600 hover:bg-gray-50 border-l border-gray-200">Este mes</button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Total de productos</p>
          <p className="text-4xl font-medium text-corp-navy mt-3">1,248</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Total de stock</p>
          <p className="text-4xl font-medium text-corp-navy mt-3">42,890</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-shrimp-red/25 p-6 relative overflow-hidden">
          <span className="absolute top-0 right-0 bg-shrimp-red text-white text-[10px] font-medium px-2 py-1 rounded-bl-lg uppercase tracking-wide">Crítico</span>
          <p className="text-xs font-medium text-shrimp-red uppercase tracking-widest">Stock bajo</p>
          <p className="text-4xl font-medium text-shrimp-red mt-3">12</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Sin stock</p>
          <p className="text-4xl font-medium text-gray-800 mt-3">3</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-base font-medium text-corp-navy mb-8">Movimiento de los últimos 7 días</h3>

        <div className="flex items-end justify-around gap-3 h-52 border-b border-l border-gray-200 px-2 pb-2">
          {data.map(({ label, e, s }) => {
            const eH = Math.round((e / max) * maxH)
            const sH = Math.round((s / max) * maxH)
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-0">
                <div className="flex items-end gap-1 w-full justify-center">
                  <div className="flex-1 max-w-[20px] rounded-t bg-gray-300 hover:bg-gray-400 transition-colors" style={{height: `${eH}px`}} title={`Entradas: ${e}`}></div>
                  <div className="flex-1 max-w-[20px] rounded-t bg-corp-navy hover:opacity-75 transition-opacity" style={{height: `${sH}px`}} title={`Salidas: ${s}`}></div>
                </div>
                <span className="mt-3 text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gray-300"></span> Entradas
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-corp-navy"></span> Salidas
          </div>
        </div>
      </div>
    </div>
  )
}
