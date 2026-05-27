import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import userMock from '../mock/user'
import courseMock from '../mock/course'
import assignmentMock from '../mock/assignment'
import gradeMock from '../mock/grade'
import studentMock from '../mock/student'
import router from '../router'

// 合并所有mock接口
const allMocks = [
  ...userMock,
  ...courseMock,
  ...assignmentMock,
  ...gradeMock,
  ...studentMock
]

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
        case 400: {
          const detail = error.response.data?.detail || error.response.data?.msg || ''
          if (detail) {
            ElMessage.error(detail)
          } else if (error.response.data?.data?.errors) {
            const msgs = error.response.data.data.errors.map((e: any) => e.message).join('; ')
            ElMessage.error(msgs || '请求参数错误')
          } else {
            ElMessage.error('请求参数错误')
          }
          break
        }
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.detail || error.response.data?.msg || error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

// Mock请求处理函数
const mockRequest = (url: string, method: string, data?: any) => {
  // 使用完整的 API 路径进行匹配（包含 /api/v1 前缀）
  const fullUrl = '/api/v1' + url
  console.log('[Mock] 检查请求:', fullUrl, method)
  
  const mock = allMocks.find(m => {
    const mockUrl = m.url
    const mockMethod = m.method?.toLowerCase()
    const matchMethod = mockMethod === method.toLowerCase()
    
    // 简单路径匹配（支持通配符）
    let matchUrl = false
    if (mockUrl.includes('*')) {
      const regex = new RegExp('^' + mockUrl.replace(/\*/g, '[^/]+') + '$')
      matchUrl = regex.test(fullUrl)
    } else {
      matchUrl = mockUrl === fullUrl
    }
    
    console.log('[Mock] 检查接口:', mockUrl, mockMethod, '匹配:', matchUrl && matchMethod)
    
    return matchUrl && matchMethod
  })
  
  if (mock && mock.response) {
    console.log('[Mock] 拦截到请求:', fullUrl, method)
    const response = mock.response({ body: data, query: data })
    console.log('[Mock] 返回响应:', response)
    return Promise.resolve(response)
  }
  
  // 如果没有找到mock，返回一个错误
  console.warn('[Mock] 未找到匹配的接口:', fullUrl, method)
  return Promise.reject(new Error(`Mock接口未找到: ${method} ${fullUrl}`))
}

// 检查是否启用Mock（默认禁用）
const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true'

// 封装的request对象，默认使用真实请求，可通过环境变量启用Mock
export const request = {
  get: async (url: string, params?: any) => {
    if (enableMock) {
      try {
        // 尝试使用mock
        return await mockRequest(url, 'get', params)
      } catch (mockError) {
        // 如果mock失败，尝试真实请求
        console.log('[Request] Mock失败，尝试真实请求')
        return await axiosInstance.get(url, { params })
      }
    }
    // 默认使用真实请求
    return await axiosInstance.get(url, { params })
  },
  
  post: async (url: string, data?: any) => {
    if (enableMock) {
      try {
        // 尝试使用mock
        return await mockRequest(url, 'post', data)
      } catch (mockError) {
        // 如果mock失败，尝试真实请求
        console.log('[Request] Mock失败，尝试真实请求')
        return await axiosInstance.post(url, data)
      }
    }
    // 默认使用真实请求
    return await axiosInstance.post(url, data)
  },
  
  put: async (url: string, data?: any) => {
    if (enableMock) {
      try {
        // 尝试使用mock
        return await mockRequest(url, 'put', data)
      } catch (mockError) {
        // 如果mock失败，尝试真实请求
        console.log('[Request] Mock失败，尝试真实请求')
        return await axiosInstance.put(url, data)
      }
    }
    // 默认使用真实请求
    return await axiosInstance.put(url, data)
  },
  
  delete: async (url: string, params?: any) => {
    if (enableMock) {
      try {
        // 尝试使用mock
        return await mockRequest(url, 'delete', params)
      } catch (mockError) {
        // 如果mock失败，尝试真实请求
        console.log('[Request] Mock失败，尝试真实请求')
        return await axiosInstance.delete(url, { params })
      }
    }
    // 默认使用真实请求
    return await axiosInstance.delete(url, { params })
  }
}

export default axiosInstance