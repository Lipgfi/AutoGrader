import { request } from './interceptors'

// 获取学生列表
export const getStudents = async (params?: any) => {
  return await request.get('/students', params)
}

// 批量导入学生
export const importStudents = async (data: any) => {
  return await request.post('/students/import', data)
}

// 重置学生密码
export const resetStudentPassword = async (userId: string, data: any) => {
  return await request.post(`/students/${userId}/reset-password`, data)
}

// 切换学生状态
export const updateStudentStatus = async (userId: string, data: any) => {
  return await request.patch(`/students/${userId}/status`, data)
}
