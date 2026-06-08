import React, { useState, useMemo } from 'react'

const chartData = [
  { label: 'Lun', e: 120, s: 140 },
  { label: 'Mar', e: 180, s: 160 },
  { label: 'Mié', e: 90,  s: 200 },
  { label: 'Jue', e: 210, s: 190 },
  { label: 'Vie', e: 150, s: 110 },
  { label: 'Sáb', e: 60,  s: 40  },
  { label: 'Dom', e: 30,  s: 20  },
]

export default function Dashboard(){
  const [activeFilter, setActiveFilter] = useState('hoy')
  const max = useMemo(() => Math.max(...chartData.flatMap(d => [d.e, d.s])), [])
  const maxH = 180

  const filters = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'ayer', label: 'Ayer' },
    { id: 'semana', label: 'Esta Semana' },
    { id: 'mes', label: 'Este Mes' }
  ]

  return (
    <>
      {/* Time Range Filters */}
      <div className="flex" data-purpose="time-filters">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {filters.map((filter, idx) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'text-white bg-corp-navy border border-corp-navy'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-100'
              } ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === filters.length - 1 ? 'rounded-r-lg' : ''} ${
                idx > 0 && activeFilter !== filter.id ? 'border-l' : ''
              } focus:z-10 focus:ring-2 focus:ring-corp-navy`}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-purpose="summary-cards">
        {/* Total de Productos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Productos</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-corp-navy">1,248</span>
          </div>
        </div>

        {/* Total de Stock */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Stock</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-corp-navy">42,890</span>
          </div>
        </div>

        {/* Total Stock Bajo (Red Accent) */}
        <div className="bg-white p-6 rounded-xl border-2 border-shrimp-red/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1 bg-shrimp-red text-white text-[10px] font-bold px-2 rounded-bl-lg uppercase">Crítico</div>
          <p className="text-sm font-medium text-shrimp-red uppercase tracking-wider">Total Stock Bajo</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-shrimp-red">12</span>
          </div>
        </div>

        {/* Total Sin Stock */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sin Stock</p>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">3</span>
          </div>
        </div>
      </div>

      {/* BEGIN: Chart Section */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm" data-purpose="movement-chart">
        <h3 className="text-xl font-bold text-corp-navy mb-10">Movimiento de los últimos 7 días</h3>
        
        {/* Bar Chart Visualization */}
        <div className="w-full flex items-end justify-around space-x-4 border-b border-l border-gray-300 pb-2 pl-2 relative" style={{minHeight: '300px'}}>
          {/* Grid Lines (Simple Visual) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -z-0 opacity-50">
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
            <div className="border-t border-gray-100 w-full h-0"></div>
          </div>

          {chartData.map(({ label, e, s }) => {
            const eH = Math.round((e / max) * maxH)
            const sH = Math.round((s / max) * maxH)
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[80px] flex items-end space-x-1">
                  <div 
                    className="bg-gray-300 flex-1 transition-all hover:bg-gray-400 cursor-pointer" 
                    style={{height: `${eH}px`}} 
                    title={`Entradas: ${e}`}
                  ></div>
                  <div 
                    className="bg-corp-navy flex-1 transition-all hover:opacity-80 cursor-pointer" 
                    style={{height: `${sH}px`}} 
                    title={`Salidas: ${s}`}
                  ></div>
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
      {/* END: Chart Section */}
    </>
  )
}
