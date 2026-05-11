import { request } from './interceptors'

// 获取课程列表
export const getCourses = async (params?: any) => {
  return await request.get('/courses', params)
}

// 获取课程详情
export const getCourseDetail = async (courseId: string) => {
  return await request.get(`/courses/${courseId}`)
}

// 创建课程
export const createCourse = async (data: any) => {
  return await request.post('/courses', data)
}

// 更新课程
export const updateCourse = async (courseId: string, data: any) => {
  return await request.put(`/courses/${courseId}`, data)
}

// 删除课程
export const deleteCourse = async (courseId: string) => {
  return await request.delete(`/courses/${courseId}`)
}
