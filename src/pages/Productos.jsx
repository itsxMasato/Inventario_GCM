import React, { useMemo, useRef, useState } from 'react'

const initialProducts = [
  { id: 1, name: 'AirFier 5 XHD', category: 'Red', unit: 'pza', stock: 90, min: 10 },
  { id: 2, name: 'Rocket 5 AC', category: 'Red', unit: 'pza', stock: 17, min: 10 },
  { id: 3, name: 'Cemento', category: 'Material', unit: 'kg', stock: 0, min: 25 },
  { id: 4, name: 'Arnes', category: 'Seguridad', unit: 'und', stock: 10, min: 10 },
]

export default function Productos() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState(initialProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    barcode: '',
    category: '',
    subcategory: '',
    unit: '',
    stock: 0,
    minStock: 0,
    location: '',
    description: '',
    files: [],
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const categoryOptions = {
    Maquinaria: ['Rodamientos', 'Motores', 'Ejes', 'Correas'],
    Herramientas: ['Taladros', 'Llaves', 'Destornilladores', 'Cintas'],
    'Componentes Eléctricos': ['Sensores', 'Cables', 'Fusibles', 'Terminales'],
    Repuestos: ['Filtros', 'Tornillos', 'Pernos', 'Empaques'],
  }
  const subcategoryOptions = categoryOptions[newProduct.category] || []

  const filtered = useMemo(() => {
    return items.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
      let matchesStatus = true
      if (status === 'Disponible') matchesStatus = p.stock > p.min
      if (status === 'Agotado') matchesStatus = p.stock === 0
      if (status === 'Stock bajo') matchesStatus = p.stock > 0 && p.stock <= p.min
      return matchesQuery && matchesStatus
    })
  }, [items, query, status])

  function remove(id) {
    if (!confirm('Eliminar producto?')) return
    setItems(i => i.filter(p => p.id !== id))
  }

  function edit(id) {
    const p = items.find(x => x.id === id)
    const name = prompt('Editar nombre', p.name)
    if (name) setItems(it => it.map(x => x.id === id ? { ...x, name } : x))
  }

  function handleModalChange(field, value) {
    setNewProduct(prev => {
      if (field === 'category') {
        return { ...prev, category: value, subcategory: '' }
      }
      return { ...prev, [field]: value }
    })
  }

  function openUploadDialog() {
    fileInputRef.current?.click()
  }

  function handleFileUpload(event) {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(files)
  }

  function handleAddProduct(event) {
    event.preventDefault()
    const nextId = items.length ? Math.max(...items.map(p => p.id)) + 1 : 1
    setItems(prev => [
      ...prev,
      {
        id: nextId,
        name: newProduct.name || 'Nuevo Producto',
        category: newProduct.category || 'Sin categoría',
        unit: newProduct.unit || 'u',
        stock: Number(newProduct.stock || 0),
        min: Number(newProduct.minStock || 0),
        subcategory: newProduct.subcategory || 'Sin subcategoría',
        location: newProduct.location || 'Sin ubicación',
        files: uploadedFiles,
      },
    ])
    setNewProduct({
      name: '',
      code: '',
      barcode: '',
      category: '',
      subcategory: '',
      unit: '',
      stock: 0,
      minStock: 0,
      location: '',
      description: '',
      files: [],
    })
    setUploadedFiles([])
    setIsModalOpen(false)
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-corp-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Agregar Producto
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
<div className="p-4 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar producto" className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-700 outline-none transition focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20" />
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
          </div>

          <div className="relative">
            <select value={status} onChange={e => setStatus(e.target.value)} className="block w-40 py-2 pl-3 pr-10 text-sm border-gray-300 focus:outline-none focus:ring-shrimp-red focus:border-shrimp-red rounded-lg appearance-none bg-white">
              <option value="">Estado</option>
              <option>Disponible</option>
              <option>Agotado</option>
              <option>Stock bajo</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">▾</div>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200" id="inventory-table">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Foto</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Unidad</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Min</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21H4a2 2 0 01-2-2V7a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z" />
                      <path d="M16 3v4" />
                      <path d="M8 3v4" />
                    </svg>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.min}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.stock === 0 ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>
                  ) : p.stock <= p.min ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Stock bajo</span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button onClick={() => edit(p.id)} className="inline-flex h-9 items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-corp-navy">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button onClick={() => remove(p.id)} className="inline-flex h-9 items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 hover:text-rose-600">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6v14" />
                        <path d="M16 6v14" />
                        <path d="M5 6l1-3h12l1 3" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Fill space like the sketch */}
            {[...Array(3)].map((_, i) => (
              <tr key={`empty-${i}`} className="h-14"><td className="border-b border-gray-100" colSpan={8}></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-5xl max-h-[calc(100vh-3rem)] overflow-hidden overflow-y-auto rounded-4xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-corp-navy text-white text-2xl">+</span>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">Agregar Producto</p>
                  <h1 className="text-2xl font-semibold text-corp-navy">Nuevo producto al inventario</h1>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl bg-white px-4 py-3 text-slate-600 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-8 px-8 py-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  Nombre del Producto
                  <input
                    value={newProduct.name}
                    onChange={e => handleModalChange('name', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                    placeholder="Ej. Rodamiento Industrial SKF"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  Código
                  <input
                    value={newProduct.code}
                    onChange={e => handleModalChange('code', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                    placeholder="PRD-00123"
                  />
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  Código de barras
                  <div className="relative">
                    <input
                      value={newProduct.barcode}
                      onChange={e => handleModalChange('barcode', e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                      placeholder="7891234567890"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">⌁</span>
                  </div>
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  Categoría
                  <select
                    value={newProduct.category}
                    onChange={e => handleModalChange('category', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  >
                    <option value="">Seleccione categoría</option>
                    <option>Maquinaria</option>
                    <option>Herramientas</option>
                    <option>Componentes Eléctricos</option>
                    <option>Repuestos</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-600">
                  Sub-categoría
                  <select
                    value={newProduct.subcategory}
                    onChange={e => handleModalChange('subcategory', e.target.value)}
                    disabled={!newProduct.category}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">{newProduct.category ? 'Seleccione sub-categoría' : 'Seleccione categoría primero'}</option>
                    {subcategoryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  Unidad de medida
                  <select
                    value={newProduct.unit}
                    onChange={e => handleModalChange('unit', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  >
                    <option value="">Seleccione unidad</option>
                    <option>Unidades (u)</option>
                    <option>Kilogramos (kg)</option>
                    <option>Metros (m)</option>
                    <option>Litros (l)</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-600">
                  Stock inicial
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={e => handleModalChange('stock', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  Stock mínimo
                  <input
                    type="number"
                    value={newProduct.minStock}
                    onChange={e => handleModalChange('minStock', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  Ubicación
                  <select
                    value={newProduct.location}
                    onChange={e => handleModalChange('location', e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  >
                    <option value="">Bodega / Pasillo</option>
                    <option>Bodega A - Pasillo 04</option>
                    <option>Bodega B - Pasillo 12</option>
                    <option>Área de Carga</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-600">
                Descripción (opcional)
                <textarea
                  value={newProduct.description}
                  onChange={e => handleModalChange('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-corp-navy focus:ring-2 focus:ring-corp-navy/20"
                  placeholder="Detalles técnicos, especificaciones, proveedor recomendado..."
                />
              </label>

              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-[48px] text-corp-navy">upload_file</span>
                  <button
                    type="button"
                    onClick={openUploadDialog}
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Seleccionar archivos
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-1 text-left text-sm text-slate-600 w-full max-w-2xl">
                      <p className="font-semibold text-slate-700">Archivos seleccionados:</p>
                      {uploadedFiles.map(file => (
                        <p key={file.name} className="truncate">{file.name}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Arrastra y suelta o selecciona archivos aquí</p>
                  )}
                  <p className="text-xs text-slate-400">PNG, JPG, PDF hasta 10MB</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end sm:items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-corp-navy px-6 py-3 text-sm font-semibold text-corp-navy hover:bg-corp-navy/5 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-shrimp-red px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined"></span>
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
