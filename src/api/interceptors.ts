import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { stores } from '../stores'
import router from '../router'
import { handleError } from '../utils/errorHandler'

const apiBaseURL = import.meta.env.VITE_B4_API_BASE_URL || '/api/v1'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  (config: any) => {
    const userStore = stores.user()
    if (userStore && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
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
