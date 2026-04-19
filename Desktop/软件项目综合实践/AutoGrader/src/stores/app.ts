import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    message: {
      show: false,
      content: '',
      type: 'info' as 'success' | 'warning' | 'error' | 'info'
    }
  }),
  getters: {
    getLoading: (state) => state.loading,
    getMessage: (state) => state.message
  },
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    showMessage(content: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
      this.message = {
        show: true,
        content,
        type
      }
      setTimeout(() => {
        this.message.show = false
      }, 3000)
    }
  }
})
