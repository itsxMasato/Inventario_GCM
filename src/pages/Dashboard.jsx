import React, { useState, useMemo, useEffect } from 'react'

export default function Dashboard(){
  const [activeFilter, setActiveFilter] = useState('hoy')
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])

  // Cargar datos del localStorage (futuro: API)
  useEffect(() => {
    try {
      const productsData = JSON.parse(localStorage.getItem('demo_products_v1') || '[]')
      const movementsData = JSON.parse(localStorage.getItem('movimientos') || '[]')
      setProducts(productsData)
      setMovements(movementsData)
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }, [])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.min || 10)).length
    const outOfStock = products.filter(p => p.stock === 0).length

    return { totalProducts, totalStock, lowStock, outOfStock }
  }, [products])

  // Generar datos del gráfico basado en movimientos
  const chartData = useMemo(() => {
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return d
    })

    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    
    const data = last7Days.map((date, idx) => {
      const dateStr = date.toISOString().slice(0, 10)
      const dayMovements = movements.filter(m => {
        const movDate = m.date || m.timestamp
        return movDate && movDate.slice(0, 10) === dateStr
      })

      const entradas = dayMovements.filter(m => m.status === 'Entrada' || m.type === 'entrada').reduce((s, m) => s + (m.stock || m.cantidad || 0), 0)
      const salidas = dayMovements.filter(m => m.status === 'Salida' || m.type === 'salida').reduce((s, m) => s + (m.stock || m.cantidad || 0), 0)

      return { label: days[idx], e: entradas, s: salidas }
    })

    return data
  }, [movements])

  const max = useMemo(() => Math.max(...chartData.flatMap(d => [d.e, d.s]), 1), [chartData])
  const maxH = 220

  const filters = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'ayer', label: 'Ayer' },
    { id: 'semana', label: 'Esta Semana' },
    { id: 'mes', label: 'Este Mes' }
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex justify-between">
        <div className="inline-flex rounded-full bg-white p-1 shadow-sm border border-slate-200" role="group" data-purpose="time-filters">
          {filters.map((filter, idx) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 text-sm font-semibold transition-colors ${
                activeFilter === filter.id
                  ? 'text-white bg-corp-navy'
                  : 'text-slate-600 bg-white hover:bg-slate-50'
              } ${idx === 0 ? 'rounded-l-full' : ''} ${idx === filters.length - 1 ? 'rounded-r-full' : ''}`}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-purpose="summary-cards">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-corp-navy">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h18" />
                <path d="M3 12h18" />
                <path d="M3 17h18" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-slate-400">Total de Productos</p>
          </div>
          <div className="mt-5">
            <span className="text-4xl font-extrabold text-corp-navy">{stats.totalProducts}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-corp-navy">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16v12H4z" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-slate-400">Total de Stock</p>
          </div>
          <div className="mt-5">
            <span className="text-4xl font-extrabold text-corp-navy">{stats.totalStock.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-rose-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v6" />
                <path d="M9 12h6" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-rose-600">Stock bajo</p>
          </div>
          <div className="mt-5">
            <span className="text-4xl font-extrabold text-rose-600">{stats.lowStock}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-corp-navy">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M5 15h14" />
              </svg>
            </div>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-slate-400">Sin Stock</p>
          </div>
          <div className="mt-5">
            <span className="text-4xl font-extrabold text-corp-navy">{stats.outOfStock}</span>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" data-purpose="movement-chart">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-corp-navy">Movimiento de los últimos 7 días</h3>
          </div>

          <div className="relative border-b border-slate-200 pb-8" style={{ minHeight: '340px' }}>
            <div className="absolute inset-x-0 top-10 flex h-56 flex-col justify-between text-slate-200">
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
            </div>

            <div className="relative z-10 grid h-full gap-4 pt-3 sm:grid-cols-7">
              {chartData.map(({ label, e, s }) => {
                const eH = Math.round((e / max) * maxH)
                const sH = Math.round((s / max) * maxH)
                return (
                  <div key={label} className="flex flex-col items-center justify-end gap-3">
                    <div className="flex h-full w-full max-w-18 flex-col justify-end gap-2">
                      <div className="h-full flex flex-col justify-end gap-2 rounded-3xl bg-slate-50 p-2">
                        <div className="h-full flex items-end gap-2">
                          <span className="block h-px w-full"></span>
                          <span className="block h-px w-full"></span>
                        </div>
                        <div className="flex h-full items-end justify-between gap-2">
                          <div className="w-1/2 rounded-full bg-emerald-400 transition-all duration-300 hover:bg-emerald-500 cursor-pointer" style={{ height: `${eH}px` }} title={`Entradas: ${e}`} />
                          <div className="w-1/2 rounded-full bg-corp-navy transition-all duration-300 hover:bg-slate-900 cursor-pointer" style={{ height: `${sH}px` }} title={`Salidas: ${s}`} />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-px w-3 rounded-full bg-emerald-400" />
              <span className="font-medium">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px w-3 rounded-full bg-corp-navy" />
              <span className="font-medium">Salidas</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
