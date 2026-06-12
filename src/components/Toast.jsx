import React, { useEffect, useState } from 'react'

export default function Toast({
  id,
  type = 'success', // success, error, info, warning, confirm
  title,
  message,
  transactionRef,
  onClose,
  duration = 4000,
  action,
  onAction,
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (type !== 'confirm' && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, type, onClose])

  const colors = {
    success: {
      icon: 'check_circle',
      bg: 'bg-green-50',
      bar: 'bg-green-600',
      iconColor: 'text-green-600',
      button: 'navy-button',
      badge: 'bg-green-100 text-green-800',
    },
    error: {
      icon: 'error_circle',
      bg: 'bg-red-50',
      bar: 'bg-red-600',
      iconColor: 'text-red-600',
      button: 'bg-red-600 text-white hover:bg-red-700',
      badge: 'bg-red-100 text-red-800',
    },
    warning: {
      icon: 'warning_circle',
      bg: 'bg-amber-50',
      bar: 'bg-amber-600',
      iconColor: 'text-amber-600',
      button: 'navy-button',
      badge: 'bg-amber-100 text-amber-800',
    },
    info: {
      icon: 'info_circle',
      bg: 'bg-blue-50',
      bar: 'bg-blue-600',
      iconColor: 'text-blue-600',
      button: 'navy-button',
      badge: 'bg-blue-100 text-blue-800',
    },
    confirm: {
      icon: 'help_circle',
      bg: 'bg-slate-50',
      bar: 'bg-slate-600',
      iconColor: 'text-slate-600',
      button: 'navy-button',
      badge: 'bg-slate-100 text-slate-800',
    },
  }

  const config = colors[type] || colors.info

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay transition-opacity duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 7, 33, 0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className={`${config.bg} w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 border border-slate-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Accent bar */}
        <div className={`h-2 w-full ${config.bar}`}></div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full ${config.badge} flex items-center justify-center mb-4`}>
            <span
              className={`material-symbols-outlined text-5xl ${config.iconColor}`}
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              {config.icon}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-slate-600 max-w-xs leading-relaxed">{message}</p>

          {/* Action buttons */}
          <div className="mt-8 w-full flex gap-3 justify-center">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors uppercase tracking-wide"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onAction?.()
                    setIsVisible(false)
                    setTimeout(onClose, 300)
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm ${config.button} transition-colors uppercase tracking-wide`}
                >
                  Confirmar
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="navy-button text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 tracking-wide uppercase text-sm w-full"
                style={{ backgroundColor: '#071D4C' }}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        {transactionRef && (
          <div
            className="bg-slate-100 py-3 px-6 flex justify-center border-t border-slate-200"
            style={{ backgroundColor: '#e9e7ec' }}
          >
            <span className="text-xs text-slate-600 uppercase tracking-tighter font-semibold">
              Ref: {transactionRef}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
