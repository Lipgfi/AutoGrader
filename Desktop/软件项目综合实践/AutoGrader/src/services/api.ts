import { request } from '../api/interceptors'
import { ElMessage } from 'element-plus'

const api = {
  get: async (url: string, params?: any) => {
    try {
      const response = await request.get(url, params)
      if (response.code === 200 || response.code === 201) {
        return response.data
      } else {
        ElMessage.error(response.message || '请求失败')
        return Promise.reject(new Error(response.message || '请求失败'))
      }
    } catch (error: any) {
      ElMessage.error(error.message || '网络错误')
      return Promise.reject(error)
    }
  },

  post: async (url: string, data?: any) => {
    try {
      const response = await request.post(url, data)
      if (response.code === 200 || response.code === 201) {
        return response.data
      } else {
        ElMessage.error(response.message || '请求失败')
        return Promise.reject(new Error(response.message || '请求失败'))
      }
    } catch (error: any) {
      ElMessage.error(error.message || '网络错误')
      return Promise.reject(error)
    }
  },

  put: async (url: string, data?: any) => {
    try {
      const response = await request.put(url, data)
      if (response.code === 200 || response.code === 201) {
        return response.data
      } else {
        ElMessage.error(response.message || '请求失败')
        return Promise.reject(new Error(response.message || '请求失败'))
      }
    } catch (error: any) {
      ElMessage.error(error.message || '网络错误')
      return Promise.reject(error)
    }
  },

  delete: async (url: string, params?: any) => {
    try {
      const response = await request.delete(url, params)
      if (response.code === 200 || response.code === 201) {
        return response.data
      } else {
        ElMessage.error(response.message || '请求失败')
        return Promise.reject(new Error(response.message || '请求失败'))
      }
    } catch (error: any) {
      ElMessage.error(error.message || '网络错误')
      return Promise.reject(error)
    }
  }
}

export default api
