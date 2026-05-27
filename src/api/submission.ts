import { request } from './interceptors'

// 获取我的提交
export const getMySubmissions = async (params?: any) => {
  return await request.get('/submissions/my', params)
}

// 获取提交详情
export const getSubmissionDetail = async (submissionId: string) => {
  return await request.get(`/submissions/${submissionId}`)
}

// 创建提交到 B4 主数据库
export const createSubmission = async (data: {
  question_id: string
  assignment_id: number
  code: string
  language: string
  student_user_id: number
}) => {
  return await request.post('/submissions', data)
}

// 获取作业全部提交
export const getAssignmentSubmissions = async (assignmentId: string, params?: any) => {
  return await request.get(`/submissions/assignment/${assignmentId}/all`, params)
}

// 更新提交结果
export const updateSubmissionResult = async (submissionId: string, data: any) => {
  return await request.put(`/submissions/${submissionId}/result`, data)
}

// 手动修改提交分数
export const overrideSubmissionScore = async (submissionId: string, data: any) => {
  return await request.put(`/submissions/${submissionId}/override`, data)
}

// 获取作业提交统计
export const getAssignmentStatistics = async (assignmentId: string) => {
  return await request.get(`/submissions/statistics/assignment/${assignmentId}`)
}
