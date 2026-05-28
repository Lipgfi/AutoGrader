import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { stores } from '../stores'
import router from '../router'
import { handleError } from '../utils/errorHandler'

// 创建axios实例
const apiBaseURL = import.meta.env.VITE_B4_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: any) => {
    const userStore = stores.user()
    if (userStore && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    console.log('[Request]', config.method?.toUpperCase(), config.url, config.data || config.params)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('[Response]', response.status, response.data)
    return response.data
  },
  (error) => {
    handleError(error)
    return Promise.reject(error)
  }
)

// 封装的request对象，使用真实请求
export const request = {
  get: async (url: string, params?: any) => {
    return await axiosInstance.get(url, { params })
  },
  
  post: async (url: string, data?: any) => {
    return await axiosInstance.post(url, data)
  },
  
  put: async (url: string, data?: any) => {
    return await axiosInstance.put(url, data)
  },
  
  delete: async (url: string, params?: any) => {
    return await axiosInstance.delete(url, { params })
  }
}

export default axiosInstance
