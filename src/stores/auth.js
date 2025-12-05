import { defineStore } from 'pinia'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let parsedUser = null
    try {
      const rawUser = localStorage.getItem('user')
      if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
        parsedUser = JSON.parse(rawUser)
      }
    } catch (e) {
      console.warn('Invalid user data in localStorage:', e)
      localStorage.removeItem('user')
    }

    return {
      token: localStorage.getItem('token') || null,
      user: parsedUser,
    }
  },

  actions: {
    async login({ email, password, role }) {
      try {
        const res = await axios.post('/api/login', { email, password })

        this.token = res.data.token
        this.user = res.data.user

        // ✅ Persist valid data
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        return { success: true, data: res.data }
      } catch (err) {
        console.error(err)
        return { success: false, message: err.response?.data?.message || 'Login failed' }
      }
    },

    async register({ first_name, last_name, email, password }) {
      try {
        const res = await axios.post('/api/register', { first_name, last_name, email, password })
        return { success: true, data: res.data }
      } catch (err) {
        console.error(err)
        return { success: false, message: err.response?.data?.message || 'Registration failed' }
      }
    },

    logout() {
      const toast = useToast()
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.error('Logged out successfully.')
      window.location.href = '/' // Redirect to landing page
    },

    // ✅ Setter for user.other_info
    setOtherInfo(newInfo) {
      if (!this.user) this.user = {}
      this.user.other_info = newInfo

      // Persist updated user in localStorage
      localStorage.setItem('user', JSON.stringify(this.user))
    },
  },
})
