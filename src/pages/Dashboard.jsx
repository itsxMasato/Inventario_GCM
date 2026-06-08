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
    <div className="p-8 space-y-8 overflow-y-auto">
      {/* Topbar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-corp-navy">Dashboard</h2>
        <div className="flex items-center space-x-6">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 bg-gray-50">
            <span className="mr-4">01 / 01 / 2023</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </div>
          <button className="relative p-2 text-gray-500 hover:text-shrimp-red transition-colors" data-purpose="notifications">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-shrimp-red rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex" data-purpose="time-filters">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button className="px-6 py-2 text-sm font-medium text-white bg-corp-navy border border-corp-navy rounded-l-lg focus:z-10 focus:ring-2 focus:ring-corp-navy" type="button">
            Hoy
          </button>
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-corp-navy" type="button">
            Ayer
          </button>
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-l border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-corp-navy" type="button">
            Esta Semana
          </button>
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-corp-navy" type="button">
            Este Mes
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-purpose="summary-cards">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Productos</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-corp-navy">1,248</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Stock</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-corp-navy">42,890</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-shrimp-red/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-shrimp-red text-white text-[10px] font-bold px-2 rounded-bl-lg uppercase">Crítico</div>
          <p className="text-sm font-medium text-shrimp-red uppercase tracking-wider">Total Stock Bajo</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-shrimp-red">12</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sin Stock</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">3</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm" data-purpose="movement-chart">
        <h3 className="text-xl font-bold text-corp-navy mb-10">Movimiento de los últimos 7 días</h3>
        
        <div className="w-full flex items-end justify-around space-x-4 border-b border-l border-gray-300 pb-2 pl-2 relative" style={{minHeight: '300px'}}>
          {/* Grid Lines Visual */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -z-0 opacity-50">
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
          </div>
          
          {data.map(({ label, e, s }) => {
            const eH = Math.round((e / max) * maxH)
            const sH = Math.round((s / max) * maxH)
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[80px] flex items-end space-x-1">
                  <div className="bg-gray-300 flex-1 transition-all hover:bg-gray-400" style={{height: `${eH}px`}} title={`Entradas: ${e}`}></div>
                  <div className="bg-corp-navy flex-1 transition-all hover:opacity-80" style={{height: `${sH}px`}} title={`Salidas: ${s}`}></div>
                </div>
                <span className="mt-4 text-xs font-semibold text-gray-500 uppercase">{label}</span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-300 mr-2 rounded-sm"></span>
            <span className="text-gray-600 font-medium">Entradas</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-corp-navy mr-2 rounded-sm"></span>
            <span className="text-gray-600 font-medium">Salidas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
