import axios from 'axios'
import { ElMessage } from 'element-plus'

// B3 判题服务配置
const b3Instance = axios.create({
  baseURL: 'http://localhost:8003/api/v1/b3',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
b3Instance.interceptors.request.use(
  (config) => {
    console.log('[B3 Request]', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
b3Instance.interceptors.response.use(
  (response) => {
    console.log('[B3 Response]', response.status, response.data)
    return response.data
  },
  (error) => {
    console.error('[B3 Response Error]', error)
    if (error.response) {
      ElMessage.error(error.response.data?.message || '评测服务错误')
    } else {
      ElMessage.error('无法连接评测服务，请检查网络')
    }
    return Promise.reject(error)
  }
)

// B3 评测请求类型
export interface B3EvaluateRequest {
  question_id: string
  submitted_code: string
  submission_id: string
  language: string
}

// B3 评测响应类型
export interface B3CaseResult {
  case_id: string
  input?: string
  expected_output?: string
  actual_output?: string
  passed: boolean
  score?: number
  comment?: string
}

export interface B3EvaluateResponse {
  question_id: string
  submission_id: string
  overall_score: number
  passed_count: number
  total_count: number
  overall_comment?: string
  static_issues?: string[]
  case_results: B3CaseResult[]
}

// 获取题目列表
export const getB3Questions = async () => {
  return await b3Instance.get('/questions')
}

// 获取题目详情
export const getB3QuestionDetail = async (questionId: string) => {
  return await b3Instance.get(`/questions/${questionId}`)
}

// 获取题目测试用例
export const getB3QuestionCases = async (questionId: string) => {
  return await b3Instance.get(`/questions/${questionId}/cases`)
}

// 评测提交
export const evaluateSubmission = async (data: B3EvaluateRequest): Promise<B3EvaluateResponse> => {
  const response = await b3Instance.post('/evaluate', data)
  return response as unknown as B3EvaluateResponse
}

// 参考答案自测
export const evaluateAnswer = async (questionId: string) => {
  return await b3Instance.post(`/evaluate/answer/${questionId}`)
}

// 健康检查
export const b3HealthCheck = async () => {
  return await b3Instance.get('/health')
}

export default b3Instance
