import { request } from './interceptors'

// 获取系统统计
export const getSystemStats = async () => {
  return await request.get('/system/stats')
}

// 数据库健康检查
export const getSystemHealth = async () => {
  return await request.get('/system/health')
}

// 获取公告
export const getAnnouncements = async () => {
  return await request.get('/system/announcements')
}

// 创建公告
export const createAnnouncement = async (data: any) => {
  return await request.post('/system/announcements', data)
}

// 更新公告
export const updateAnnouncement = async (announcementId: string, data: any) => {
  return await request.put(`/system/announcements/${announcementId}`, data)
}

// 删除公告
export const deleteAnnouncement = async (announcementId: string) => {
  return await request.delete(`/system/announcements/${announcementId}`)
}

// 获取系统日志
export const getSystemLogs = async (params?: any) => {
  return await request.get('/system/logs', params)
}
