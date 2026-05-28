import { useUserStore } from './user'
import { useAppStore } from './app'

export const stores = {
  user: () => {
    try {
      return useUserStore()
    } catch {
      return null
    }
  },
  app: () => {
    try {
      return useAppStore()
    } catch {
      return null
    }
  }
}

export { useUserStore, useAppStore }
