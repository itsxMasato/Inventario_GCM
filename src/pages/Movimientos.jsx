import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const today = new Date()
const todayString = today.toISOString().slice(0, 10)

const movimientosData = [
  {
    movementId: 'MOV-001',
    id: 'CRM-001',
    productId: 'CRM-001',
    name: 'Motor Industrial Síncrono',
    stock: 1,
    status: 'En mantenimiento',
    date: todayString,
  },
  {
    movementId: 'MOV-002',
    id: 'CRM-002',
    productId: 'CRM-002',
    name: 'Bobina de Cobre Reforzada',
    stock: 1,
    status: 'Activo',
    date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  },
  {
    movementId: 'MOV-003',
    id: 'CRM-003',
    productId: 'CRM-003',
    name: 'Baterías Ion-Litio 48V',
    stock: 4,
    status: 'Activo',
    date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  },
  {
    movementId: 'MOV-004',
    id: 'CRM-004',
    productId: 'CRM-004',
    name: 'Compresor de Aire Alta Presión',
    stock: 0,
    status: 'Fuera de stock',
    date: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  },
]

const statusStyles = {
  'En mantenimiento': 'bg-red-100 text-red-700',
  Activo: 'bg-emerald-100 text-emerald-800',
  'Fuera de stock': 'bg-rose-100 text-rose-700',
}

const dateFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'ayer', label: 'Ayer' },
  { id: 'semana', label: 'Esta Semana' },
  { id: 'mes', label: 'Este Mes' },
]

function isDateInRange(dateString, filter, customRange) {
  if (!dateString) return true
  if (filter === 'todos') return true
  const date = new Date(dateString)
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round(
    (startOfDay(today).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000),
  )

  if (filter === 'hoy') return diffDays === 0
  if (filter === 'ayer') return diffDays === 1
  if (filter === 'semana') return diffDays >= 0 && diffDays < 7
  if (filter === 'mes') return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  if (filter === 'custom') {
    if (!customRange.from || !customRange.to) return true
    const fromDate = new Date(customRange.from)
    const toDate = new Date(customRange.to)
    return date >= fromDate && date <= toDate
  }
  return true
}

export default function Movimientos() {
  const [data, setData] = useState(movimientosData)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('Todos')
  const [dateFilter, setDateFilter] = useState('hoy')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [movementForm, setMovementForm] = useState({
    remitente: '',
    destinatario: '',
    cantidad: '',
    entregadoA: '',
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, dateFilter, customRange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a365d'
    ctxRef.current = ctx

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const filteredMovimientos = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = [item.id, item.name].join(' ').toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'Todos' || item.status === status
      const matchesDate = isDateInRange(item.date, dateFilter, customRange)
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [data, search, status, dateFilter, customRange])

  const rowsPerPage = 4
  const pageCount = Math.max(1, Math.ceil(filteredMovimientos.length / rowsPerPage))

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  const currentMovimientos = filteredMovimientos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const startRow = filteredMovimientos.length ? (currentPage - 1) * rowsPerPage + 1 : 0
  const endRow = Math.min(filteredMovimientos.length, currentPage * rowsPerPage)

  const handleDelete = (movementId) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return
    setData((prev) => prev.filter((item) => item.movementId !== movementId))
  }

  const openMovementModal = (item) => {
    setSelectedProduct(item)
    setMovementForm({
      remitente: '',
      destinatario: '',
      cantidad: '',
      entregadoA: '',
    })
    setIsMovementModalOpen(true)
  }

  const handleMovementFormChange = (field, value) => {
    setMovementForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleClearSignature = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSaveMovement = (event) => {
    event.preventDefault()
    if (!selectedProduct) {
      window.alert('Selecciona un producto desde la lista antes de guardar el movimiento.')
      return
    }

    const newMovement = {
      movementId: `MOV-${Date.now()}`,
      id: selectedProduct.id,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      stock: selectedProduct.stock,
      status: 'Activo',
      date: todayString,
      remitente: movementForm.remitente,
      destinatario: movementForm.destinatario,
      cantidad: movementForm.cantidad,
      entregadoA: movementForm.entregadoA,
    }

    setData((prev) => [newMovement, ...prev])
    setMovementForm({ remitente: '', destinatario: '', cantidad: '', entregadoA: '' })
    setIsMovementModalOpen(false)
    setSelectedProduct(null)
  }

  const navigate = useNavigate()

  const handleAction = (action, item) => {
    if (action === 'ver') {
      navigate(`/movimientos/${item.productId || item.id}`)
      return
    }
    if (action === 'editar') {
      window.alert(`Editar movimiento ${item.id}`)
      return
    }
    if (action === 'eliminar') {
      handleDelete(item.movementId || item.id)
    }
  }

  const handlePrint = () => window.print()

  const clearFilters = () => {
    setSearch('')
    setStatus('Todos')
    setDateFilter('todos')
    setCustomRange({ from: '', to: '' })
    setCurrentPage(1)
  }

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const point = event.touches ? event.touches[0] : event
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    }
  }

  const startDrawing = (event) => {
    const ctx = ctxRef.current
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getCanvasCoordinates(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const drawSignature = (event) => {
    if (!isDrawing) return
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = getCanvasCoordinates(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleExport = () => {
    const header = ['ID Producto', 'Nombre', 'Stock', 'Estado', 'Fecha']
    const rows = filteredMovimientos.map((item) => [item.id, item.name, item.stock, item.status, item.date])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'movimientos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderedPages = []
  for (let page = 1; page <= pageCount; page += 1) {
    renderedPages.push(page)
  }

  return (
    <div className="mt-4 space-y-8">
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-[28px] p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <label className="sr-only" htmlFor="movimientos-search">
                Buscar
              </label>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                id="movimientos-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por ID o nombre"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="font-medium text-sm text-slate-600">Estado:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
              >
                <option>Todos</option>
                <option>Activo</option>
                <option>En mantenimiento</option>
                <option>Fuera de stock</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {dateFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setDateFilter(filter.id)
                  }}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    dateFilter === filter.id
                      ? 'bg-corp-navy text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDateFilter('custom')}
                className={`rounded-2xl px-4 py-2 text-sm transition ${
                  dateFilter === 'custom'
                    ? 'bg-corp-navy text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Desde
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                Hasta
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                />
              </label>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18h12" />
                  <path d="M6 14h12" />
                  <path d="M9 22h6" />
                </svg>
                Imprimir
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17L12 10L5 17" />
                  <path d="M12 10V21" />
                </svg>
                Exportar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null)
                  setIsMovementModalOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-corp-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Registrar Movimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-500">
              <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">ID Producto</th>
              <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Nombre</th>
              <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Stock</th>
              <th className="px-6 py-4 text-sm uppercase tracking-[0.18em]">Estado</th>
              <th className="px-6 py-4 text-right text-sm uppercase tracking-[0.18em]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentMovimientos.map((item) => (
              <tr key={item.movementId || item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-corp-navy">{item.id}</td>
                <td className="px-6 py-4 text-slate-700">{item.name}</td>
                <td className="px-6 py-4 text-slate-700">{item.stock}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-slate-500">
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('ver', item)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-corp-navy"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => openMovementModal(item)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      Movimiento
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('editar', item)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('eliminar', item)}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6v14" />
                        <path d="M16 6v14" />
                        <path d="M5 6l1-3h12l1 3" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentMovimientos.length === 0 && (
              <tr className="bg-slate-50">
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  No hay movimientos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Mostrando {startRow}-{endRow} de {filteredMovimientos.length} movimientos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              {renderedPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-2xl px-3 py-2 text-sm transition ${
                    page === currentPage
                      ? 'bg-corp-navy text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === pageCount}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-2xl border border-slate-200">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#1a365d]">Movimiento</h2>
                <p className="text-sm text-slate-500">Registro de movimiento individual por producto.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMovementModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleSaveMovement} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="cod_producto">Cod Producto</label>
                <div className="md:col-span-2 relative">
                  <input
                    id="cod_producto"
                    name="cod_producto"
                    type="text"
                    value={selectedProduct?.id || 'Recuperación Automática'}
                    readOnly
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 italic">Auto-fill</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="nombre_producto">Nombre Producto</label>
                <div className="md:col-span-2">
                  <input
                    id="nombre_producto"
                    name="nombre_producto"
                    type="text"
                    value={selectedProduct?.name || 'Recuperación Automática'}
                    readOnly
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="remitente">Remitente</label>
                <div className="md:col-span-2">
                  <select
                    id="remitente"
                    name="remitente"
                    value={movementForm.remitente}
                    onChange={(e) => handleMovementFormChange('remitente', e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  >
                    <option value="">Seleccione Lista de Empresas</option>
                    <option value="empresa1">Empresa Logística A</option>
                    <option value="empresa2">Almacén Central</option>
                    <option value="empresa3">Distribuidora Norte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="destinatario">Destinatario</label>
                <div className="md:col-span-2">
                  <select
                    id="destinatario"
                    name="destinatario"
                    value={movementForm.destinatario}
                    onChange={(e) => handleMovementFormChange('destinatario', e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  >
                    <option value="">Seleccione Lista de Empresas</option>
                    <option value="empresa1">Empresa Logística A</option>
                    <option value="empresa2">Almacén Central</option>
                    <option value="empresa3">Distribuidora Norte</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="cantidad">Cantidad</label>
                <div className="md:col-span-2">
                  <select
                    id="cantidad"
                    name="cantidad"
                    value={movementForm.cantidad}
                    onChange={(e) => handleMovementFormChange('cantidad', e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  >
                    <option value="">Cantidad a enviar</option>
                    <option value="1">1 unidad</option>
                    <option value="5">5 unidades</option>
                    <option value="10">10 unidades</option>
                    <option value="50">50 unidades</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="entregadoA">Se entregó a</label>
                <div className="md:col-span-2">
                  <input
                    id="entregadoA"
                    name="entregadoA"
                    type="text"
                    value={movementForm.entregadoA}
                    onChange={(e) => handleMovementFormChange('entregadoA', e.target.value)}
                    placeholder="Nombre del empleado"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1a365d] focus:ring-[#1a365d]/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Firma</label>
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 h-48">
                  <canvas
                    ref={canvasRef}
                    className="h-full w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={drawSignature}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawSignature}
                    onTouchEnd={stopDrawing}
                  />
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1a365d] px-4 py-3 text-sm font-medium text-white hover:bg-[#15304d]"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-corp-navy">
            ↕
          </div>
          <p className="text-sm text-slate-500">Total Movimientos</p>
          <p className="mt-2 text-3xl font-semibold text-corp-navy">{data.length}</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            ↑
          </div>
          <p className="text-sm text-slate-500">Entradas (Hoy)</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-800">+{data.filter((item) => item.status === 'Activo').length}</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            ↓
          </div>
          <p className="text-sm text-slate-500">Salidas (Hoy)</p>
          <p className="mt-2 text-3xl font-semibold text-rose-700">-{data.filter((item) => item.status === 'En mantenimiento').length}</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            ✓
          </div>
          <p className="text-sm text-slate-500">Precisión Datos</p>
          <p className="mt-2 text-3xl font-semibold text-sky-700">99.8%</p>
        </div>
      </div>
    </div>
  )
}
