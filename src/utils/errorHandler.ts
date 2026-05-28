import { ElMessage, ElMessageBox } from 'element-plus'
import router from '../router'
import { stores } from '../stores'

export interface ErrorHandlerOptions {
  showMessage?: boolean
  redirectOnUnauthorized?: boolean
  customMessage?: string
}

const defaultOptions: ErrorHandlerOptions = {
  showMessage: true,
  redirectOnUnauthorized: true,
  customMessage: ''
}

export const handleError = (error: any, options: ErrorHandlerOptions = {}): void => {
  const opts = { ...defaultOptions, ...options }
  
  console.error('[Error Handler]', error)
  
  let message = opts.customMessage
  
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 401:
        message = '未授权，请重新登录'
        if (opts.redirectOnUnauthorized) {
          setTimeout(() => {
            const userStore = stores.user()
            if (userStore) {
              userStore.logout()
            }
            router.push('/login')
          }, 1500)
        }
        break
      case 403:
        message = '拒绝访问，您没有权限执行此操作'
        break
      case 404:
        message = '请求的资源不存在'
        break
      case 400:
        message = data?.message || '请求参数错误'
        break
      case 500:
        message = data?.message || '服务器内部错误，请稍后重试'
        break
      default:
        message = data?.message || `请求失败 (${status})`
    }
  } else if (error.message) {
    if (error.message.includes('Network Error') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('ETIMEDOUT')) {
      message = '网络连接失败，请检查网络或稍后重试'
    } else {
      message = error.message
    }
  } else {
    message = '未知错误'
  }
  
  if (opts.showMessage) {
    ElMessage.error(message)
  }
}

export const handleApiError = async (
  error: any,
  options: ErrorHandlerOptions = {}
): Promise<void> => {
  handleError(error, options)
}

export const handleValidationError = (errors: any[]): string[] => {
  const messages: string[] = []
  
  if (Array.isArray(errors)) {
    errors.forEach((error: any) => {
      if (error.message) {
        messages.push(error.message)
      }
    })
  } else if (errors && typeof errors === 'object') {
    Object.keys(errors).forEach(key => {
      const fieldErrors = errors[key]
      if (Array.isArray(fieldErrors)) {
        (fieldErrors as any[]).forEach((err: any) => {
          messages.push(err.message || err)
        })
      }
    })
  }
  
  if (messages.length > 0) {
    ElMessage.error(messages.join('; '))
  }
  
  return messages
}

export const showConfirmDialog = async (
  message: string,
  title: string = '确认操作',
  type: 'success' | 'warning' | 'info' | 'error' = 'warning'
): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type
    })
    return true
  } catch {
    return false
  }
}

export const showSuccessMessage = (message: string): void => {
  ElMessage.success(message)
}

export const showWarningMessage = (message: string): void => {
  ElMessage.warning(message)
}

export const showInfoMessage = (message: string): void => {
  ElMessage.info(message)
}

export default {
  handleError,
  handleApiError,
  handleValidationError,
  showConfirmDialog,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage
}