import { request } from './interceptors'

// 获取作业列表
export const getAssignments = async (params?: any) => {
  return await request.get('/assignments', params)
}

// 获取作业详情
export const getAssignmentDetail = async (assignmentId: string) => {
  return await request.get(`/assignments/${assignmentId}`)
}

// 创建作业
export const createAssignment = async (data: any) => {
  return await request.post('/assignments', data)
}

// 更新作业
export const updateAssignment = async (assignmentId: string, data: any) => {
  return await request.put(`/assignments/${assignmentId}`, data)
}

// 发布作业
export const publishAssignment = async (assignmentId: string) => {
  return await request.post(`/assignments/${assignmentId}/publish`)
}

// 删除作业
export const deleteAssignment = async (assignmentId: string) => {
  return await request.delete(`/assignments/${assignmentId}`)
}
