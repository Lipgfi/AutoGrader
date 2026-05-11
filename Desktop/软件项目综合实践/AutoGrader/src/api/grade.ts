import { request } from './interceptors'

// 获取我的成绩
export const getMyGrades = async (params?: any) => {
  return await request.get('/grades/my', params)
}

// 获取班级成绩
export const getClassGrades = async (classId: string, params?: any) => {
  return await request.get(`/grades/class/${classId}`, params)
}

// 导出作业成绩
export const exportAssignmentGrades = async (assignmentId: string) => {
  return await request.get(`/grades/export/${assignmentId}`)
}
