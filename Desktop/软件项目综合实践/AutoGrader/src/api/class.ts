import { request } from './interceptors'

// 获取班级列表
export const getClasses = async (params?: any) => {
  return await request.get('/classes', params)
}

// 创建班级
export const createClass = async (data: any) => {
  return await request.post('/classes', data)
}

// 获取班级学生
export const getClassStudents = async (classId: string) => {
  return await request.get(`/classes/${classId}/students`)
}

// 添加学生到班级
export const addStudentToClass = async (classId: string, data: any) => {
  return await request.post(`/classes/${classId}/students`, data)
}

// 批量导入学生
export const importStudents = async (classId: string, data: any) => {
  return await request.post(`/classes/${classId}/students/import`, data)
}

// 移除班级学生
export const removeStudentFromClass = async (classId: string, studentUserId: string) => {
  return await request.delete(`/classes/${classId}/students/${studentUserId}`)
}
