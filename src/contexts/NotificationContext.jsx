import React, { createContext, useContext, useState } from 'react'
import Toast from '../components/Toast'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = (options) => {
    const id = Date.now()
    const notification = {
      id,
      type: 'success',
      duration: 4000,
      ...options,
    }
    setNotifications(prev => [...prev, notification])
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const value = {
    showNotification,
    removeNotification,
    success: (title, message, transactionRef) =>
      showNotification({ type: 'success', title, message, transactionRef }),
    error: (title, message) => showNotification({ type: 'error', title, message, duration: 5000 }),
    warning: (title, message) => showNotification({ type: 'warning', title, message }),
    info: (title, message) => showNotification({ type: 'info', title, message }),
    confirm: (title, message, onConfirm) =>
      showNotification({
        type: 'confirm',
        title,
        message,
        duration: 0,
        onAction: onConfirm,
      }),
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[90]">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            transactionRef={notification.transactionRef}
            duration={notification.duration}
            action={notification.action}
            onAction={notification.onAction}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }
  return context
}
