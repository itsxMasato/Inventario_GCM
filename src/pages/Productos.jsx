import React, { useMemo, useState } from 'react'

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Productos</h2>
        <div className="flex items-center gap-4">
          <button className="bg-shrimp-red text-white px-4 py-2 rounded-lg font-semibold">Agregar</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-72">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:ring-shrimp-red focus:border-shrimp-red sm:text-sm" />
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg></div>
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
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">IMG</div>
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
                  <div className="flex items-center gap-3">
                    <button onClick={() => edit(p.id)} className="hover:text-blue-600">✎</button>
                    <button onClick={() => remove(p.id)} className="hover:text-red-600">🗑</button>
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
    </div>
  )
}
