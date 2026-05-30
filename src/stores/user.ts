import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id?: string
  userId?: string
  username?: string
  realName?: string
  name?: string
  role?: string
  [key: string]: unknown
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(sessionStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>((() => {
    try {
      const stored = sessionStorage.getItem('userInfo')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })())
  
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  
  const userRole = computed(() => userInfo.value?.role || '')
  
  const userId = computed(() => userInfo.value?.id || userInfo.value?.userId || '')
  
  const realName = computed(() => userInfo.value?.realName || userInfo.value?.name || '')
  
  const username = computed(() => userInfo.value?.username || '')
  
  function setToken(newToken: string) {
    token.value = newToken
    if (newToken) {
      sessionStorage.setItem('token', newToken)
    } else {
      sessionStorage.removeItem('token')
    }
  }
  
  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
    if (info) {
      sessionStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      sessionStorage.removeItem('userInfo')
    }
  }
  
  function logout() {
    token.value = ''
    userInfo.value = null
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userInfo')
  }
  
  function updateUserInfo(partialInfo: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...partialInfo }
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }
  
  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    userRole,
    userId,
    realName,
    username,
    // Actions
    setToken,
    setUserInfo,
    logout,
    updateUserInfo
  }
})
