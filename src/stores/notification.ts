/**
 * Pinia store for notification management
 * Following project standards for global state
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface NotificationAction {
  label: string
  handler: () => void
  style?: 'primary' | 'secondary'
  dismiss?: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title?: string
  message: string
  duration: number // 0 = persistent
  createdAt: number
  actions?: NotificationAction[]
  persistent?: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  
  // Generate unique ID
  function generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Add notification
  function addNotification(config: Omit<Notification, 'id' | 'createdAt'>) {
    const notification: Notification = {
      id: generateId(),
      createdAt: Date.now(),
      duration: config.persistent ? 0 : (config.duration || 5000),
      ...config
    }
    
    notifications.value.push(notification)
    
    // Limit notifications count
    if (notifications.value.length > 5) {
      notifications.value.shift()
    }
    
    return notification.id
  }
  
  // Convenience methods
  function success(message: string, title?: string, options?: Partial<Notification>) {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
      ...options
    })
  }
  
  function error(message: string, title?: string, options?: Partial<Notification>) {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer for errors
      ...options
    })
  }
  
  function warning(message: string, title?: string, options?: Partial<Notification>) {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options
    })
  }
  
  function info(message: string, title?: string, options?: Partial<Notification>) {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    })
  }
  
  function loading(message: string, title?: string) {
    return addNotification({
      type: 'loading',
      title,
      message,
      duration: 0, // Persistent until dismissed
      persistent: true
    })
  }
  
  // Dismiss notification
  function dismissNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // Clear all notifications
  function clearAll() {
    notifications.value = []
  }
  
  // Clear by type
  function clearByType(type: Notification['type']) {
    notifications.value = notifications.value.filter(n => n.type !== type)
  }
  
  // Update notification
  function updateNotification(id: string, updates: Partial<Notification>) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      Object.assign(notification, updates)
    }
  }
  
  // Animation helpers for specific use cases
  function showAssetLoadingProgress(assetName: string) {
    return loading(`載入 ${assetName}...`, '載入中')
  }
  
  function showAssetLoadedSuccess(assetName: string) {
    success(`${assetName} 載入完成`, '載入成功')
  }
  
  function showAnimationError(error: string) {
    return error(`動畫播放錯誤: ${error}`, '播放失敗', {
      actions: [
        {
          label: '重試',
          handler: () => {
            // This will be handled by the component
            window.dispatchEvent(new CustomEvent('retry-animation'))
          },
          style: 'primary'
        }
      ]
    })
  }
  
  function showNetworkError() {
    return error('網路連線失敗，請檢查網路設定', '連線錯誤', {
      actions: [
        {
          label: '重試',
          handler: () => {
            window.location.reload()
          },
          style: 'primary'
        }
      ],
      persistent: true
    })
  }
  
  return {
    // State
    notifications,
    
    // Actions
    addNotification,
    success,
    error,
    warning,
    info,
    loading,
    dismissNotification,
    clearAll,
    clearByType,
    updateNotification,
    
    // Animation-specific helpers
    showAssetLoadingProgress,
    showAssetLoadedSuccess,
    showAnimationError,
    showNetworkError
  }
})