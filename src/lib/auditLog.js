export function addAuditLog(action, details = '') {
  try {
    const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}')
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]')
    
    const newLog = {
      action,
      user: authUser.username || 'Sistema',
      details,
      timestamp: new Date().toISOString(),
    }
    
    logs.push(newLog)
    localStorage.setItem('audit_logs', JSON.stringify(logs))
  } catch (err) {
    console.error('Error registrando evento:', err)
  }
}

export function exportToCSV(data, filename = 'export.csv') {
  try {
    const headers = Object.keys(data[0] || {})
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Registrar en bitácora
    addAuditLog('export', `Exportado: ${filename}`)
    return true
  } catch (err) {
    console.error('Error exportando:', err)
    return false
  }
}

export function printData(htmlContent, title = 'Documento') {
  try {
    const currentDate = new Date()
    const printDate = currentDate.toLocaleString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const printWindow = window.open('', '', 'width=900,height=700')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #1f2937;
            line-height: 1.6;
            padding: 40px;
            background: white;
          }
          
          .print-container {
            max-width: 900px;
            margin: 0 auto;
          }
          
          .print-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #071D4C;
          }
          
          .logo-placeholder {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #071D4C 0%, #CF301D 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            flex-shrink: 0;
          }

          .logo-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: white;
          }

          .logo-placeholder .logo-fallback {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
            padding: 8px;
          }
          
          .header-info {
            flex: 1;
          }
          
          .company-name {
            font-size: 22px;
            font-weight: 700;
            color: #071D4C;
            margin-bottom: 4px;
          }
          
          .report-title {
            font-size: 18px;
            font-weight: 600;
            color: #CF301D;
            margin-bottom: 8px;
          }
          
          .report-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta-item {
            display: flex;
            gap: 8px;
          }
          
          .meta-label {
            font-weight: 600;
            color: #374151;
          }
          
          .content {
            margin: 30px 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
          }
          
          thead {
            background-color: #071D4C;
          }
          
          th {
            padding: 14px;
            text-align: left;
            font-weight: 700;
            color: white;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #071D4C;
          }
          
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            color: #374151;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          tbody tr:hover {
            background-color: #f3f4f6;
          }
          
          .status {
            display: inline-block;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          
          .status.active,
          .status.entrada {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          .status.inactive {
            background-color: #fee2e2;
            color: #991b1b;
          }
          
          .status.suspended {
            background-color: #fef3c7;
            color: #92400e;
          }
          
          .status.salida {
            background-color: #dbeafe;
            color: #1e40af;
          }
          
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            font-size: 11px;
            color: #9ca3af;
          }
          
          .footer-note {
            text-align: left;
          }
          
          .footer-confidential {
            text-align: right;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 20mm;
              background: white;
            }
            
            .print-container {
              max-width: 100%;
            }
            
            table {
              page-break-inside: avoid;
            }
            
            tbody tr {
              page-break-inside: avoid;
            }
            
            @page {
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <div class="logo-placeholder">
              <img src="/logo.png" alt="GCM Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
            </div>
            <div class="header-info">
              <div class="company-name">Grupo Camaronero Milcien</div>
              <div class="report-title">${title}</div>
              <div class="report-meta">
                <div class="meta-item">
                  <span class="meta-label">Fecha:</span>
                  <span>${printDate}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Tipo:</span>
                  <span>${title}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="content">
            ${htmlContent}
          </div>
          
          <div class="print-footer">
            <div class="footer-note">
              <p>Sistema de Gestión de Inventario GCM v1.0</p>
            </div>
            <div class="footer-confidential">
              <p>© 2026 Grupo Camaronero Milcien. Documento Confidencial.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
      addAuditLog('print', `Impreso: ${title}`)
    }, 250)
    
    return true
  } catch (err) {
    console.error('Error imprimiendo:', err)
    return false
  }
}
