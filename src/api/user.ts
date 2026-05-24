import { request } from './interceptors'

// 获取当前用户信息
export const getCurrentUser = async () => {
  return await request.get('/users/me')
}

// 更新当前用户
export const updateCurrentUser = async (data: any) => {
  return await request.put('/users/me', data)
}

// 获取用户列表
export const getUsers = async (params?: any) => {
  return await request.get('/users', params)
}

// 创建教师账号
export const createTeacher = async (data: any) => {
  return await request.post('/users', data)
}

// 禁用用户
export const deactivateUser = async (userId: string) => {
  return await request.post(`/users/${userId}/deactivate`)
}
