import { request } from './interceptors'

// 获取题目列表
export const getQuestions = async (params?: any) => {
  return await request.get('/questions', params)
}

// 获取题目详情
export const getQuestionDetail = async (questionId: string) => {
  return await request.get(`/questions/${questionId}`)
}

// 创建题目
export const createQuestion = async (data: any) => {
  return await request.post('/questions', data)
}

// 更新题目
export const updateQuestion = async (questionId: string, data: any) => {
  return await request.put(`/questions/${questionId}`, data)
}

// 删除题目
export const deleteQuestion = async (questionId: string) => {
  return await request.delete(`/questions/${questionId}`)
}

// 获取题目测试用例
export const getQuestionTestCases = async (questionId: string) => {
  return await request.get(`/questions/${questionId}/testcases`)
}

// 添加测试用例
export const addQuestionTestCase = async (questionId: string, data: any) => {
  return await request.post(`/questions/${questionId}/testcases`, data)
}

// 删除测试用例
export const deleteQuestionTestCase = async (questionId: string, testCaseId: string) => {
  return await request.delete(`/questions/${questionId}/testcases/${testCaseId}`)
}
