import { request } from './interceptors'

// 登录
export const login = async (data: any) => {
  return await request.post('/auth/login', data)
}

// 注册
export const register = async (data: any) => {
  return await request.post('/auth/register', data)
}

// 登出
export const logout = async () => {
  return await request.post('/auth/logout')
}

// 刷新令牌
export const refreshToken = async (data: any) => {
  return await request.post('/auth/refresh', data)
}

// 重置密码
export const resetPassword = async (data: any) => {
  return await request.post('/auth/reset-password', data)
}
