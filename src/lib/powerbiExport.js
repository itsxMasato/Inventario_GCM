import * as XLSX from 'xlsx'

// Export an array of objects to an Excel file suitable for Power BI import
export function exportToPowerBI({ data = [], filename = 'export.xlsx', meta = {} } = {}) {
  try {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')

    // Add metadata sheet
    const metaEntries = Object.entries(meta).map(([k, v]) => ({ Key: k, Value: v }))
    const wsMeta = XLSX.utils.json_to_sheet(metaEntries)
    XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata')

    XLSX.writeFile(wb, filename)
  } catch (err) {
    console.error('Export to Power BI failed', err)
    throw err
  }
}
