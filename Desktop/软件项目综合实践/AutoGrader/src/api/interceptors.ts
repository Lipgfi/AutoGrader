import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore()
    if (userStore.token) {
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
    console.error('[Response Error]', error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          // 使用Vue路由导航，避免页面完全刷新
          router.push('/login')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
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