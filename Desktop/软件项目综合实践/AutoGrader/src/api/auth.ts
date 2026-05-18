import { request } from './interceptors'
import type { UserLoginRequest, UserRegisterRequest, UserInfo, ApiResponse } from '../types/api'

// 获取验证码
export const getCaptcha = async (): Promise<ApiResponse<{ captcha_id: string; captcha_image: string }>> => {
  return await request.get('/auth/captcha')
}

// 校验验证码
export const verifyCaptcha = async (data: { captcha_id: string; captcha_code: string }): Promise<ApiResponse> => {
  return await request.post('/auth/captcha/verify', data)
}

// 登录
export const login = async (data: UserLoginRequest & { captcha_id?: string }): Promise<ApiResponse<{ token: string; user?: UserInfo; role?: string; userId?: string }>> => {
  return await request.post('/auth/login', data)
}

// 注册
export const register = async (data: UserRegisterRequest): Promise<ApiResponse<UserInfo>> => {
  return await request.post('/auth/register', data)
}

// 登出
export const logout = async (): Promise<ApiResponse> => {
  return await request.post('/auth/logout')
}

// 刷新令牌
export const refreshToken = async (data: { refresh_token: string }): Promise<ApiResponse<{ token: string }>> => {
  return await request.post('/auth/refresh', data)
}

// 重置密码
export const resetPassword = async (data: { email: string; code?: string; new_password: string }): Promise<ApiResponse> => {
  return await request.post('/auth/reset-password', data)
}
