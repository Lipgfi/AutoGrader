import { request } from './interceptors'
import type { UserLoginRequest, UserRegisterRequest, UserInfo, ApiResponse } from '../types/api'

// 获取验证码
export const getCaptcha = async (): Promise<ApiResponse<{ captcha_id: string; captcha_image: string }>> => {
  const response = await request.get('/auth/captcha');
  return response.data;
}

// 校验验证码
export const verifyCaptcha = async (data: { captcha_id: string; captcha_code: string }): Promise<ApiResponse> => {
  const response = await request.post('/auth/captcha/verify', data);
  return response.data;
}

// 登录
export const login = async (data: UserLoginRequest): Promise<ApiResponse<{ token: string; user?: UserInfo; role?: string; userId?: string }>> => {
  const response = await request.post('/auth/login', data);
  return response.data;
}

// 注册
export const register = async (data: UserRegisterRequest): Promise<ApiResponse<UserInfo>> => {
  const response = await request.post('/auth/register', data);
  return response.data;
}

// 登出
export const logout = async (): Promise<ApiResponse> => {
  const response = await request.post('/auth/logout');
  return response.data;
}

// 刷新令牌
export const refreshToken = async (data: { refresh_token: string }): Promise<ApiResponse<{ token: string }>> => {
  const response = await request.post('/auth/refresh', data);
  return response.data;
}

// 重置密码
export const resetPassword = async (data: { email: string; code?: string; new_password: string }): Promise<ApiResponse> => {
  const response = await request.post('/auth/reset-password', data);
  return response.data;
}
