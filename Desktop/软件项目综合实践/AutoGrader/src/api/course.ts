import { request } from './interceptors'
import type { Course, CourseCreateRequest, ApiResponse, PagedResponse } from '../types/api'

// 获取课程列表
export const getCourses = async (params?: any): Promise<ApiResponse<PagedResponse<Course>>> => {
  return await request.get('/courses', params)
}

// 获取课程详情
export const getCourseDetail = async (courseId: string): Promise<ApiResponse<Course>> => {
  return await request.get(`/courses/${courseId}`)
}

// 创建课程
export const createCourse = async (data: CourseCreateRequest): Promise<ApiResponse<Course>> => {
  return await request.post('/courses', data)
}

// 更新课程
export const updateCourse = async (courseId: string, data: Partial<CourseCreateRequest>): Promise<ApiResponse<Course>> => {
  return await request.put(`/courses/${courseId}`, data)
}

// 删除课程
export const deleteCourse = async (courseId: string): Promise<ApiResponse> => {
  return await request.delete(`/courses/${courseId}`)
}
