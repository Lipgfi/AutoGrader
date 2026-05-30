<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
    </div>
    
    <div class="login-form-wrapper">
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>AutoGrader</h1>
        </div>
        <p class="subtitle">在线编程作业评测系统</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <div class="role-tabs">
          <div class="role-label">选择身份</div>
          <el-radio-group v-model="loginForm.role" class="role-group">
            <el-radio-button value="student">
              <el-icon><User /></el-icon>
              <span>学生</span>
            </el-radio-button>
            <el-radio-button value="teacher">
              <el-icon><Reading /></el-icon>
              <span>教师</span>
            </el-radio-button>
            <el-radio-button value="admin">
              <el-icon><Setting /></el-icon>
              <span>管理员</span>
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入学号/工号/账号"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
          <el-input
            v-model="loginForm.captcha"
            placeholder="请输入验证码"
            prefix-icon="Picture"
            size="large"
            class="captcha-input"
            @keyup.enter="handleLogin"
          />
          <div class="captcha-image" @click="refreshCaptcha" :title="'点击刷新验证码'">
            <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-img" />
            <span v-else class="captcha-loading">加载中...</span>
          </div>
        </div>
        </el-form-item>
        
        <div class="form-options">
          <el-checkbox v-model="loginForm.remember" class="remember-checkbox">
            <span class="remember-text">记住密码</span>
          </el-checkbox>
          <el-link type="primary" :underline="'never'" class="forgot-link">
            忘记密码？
          </el-link>
        </div>
        
        <el-form-item class="submit-item">
          <el-button
            type="primary"
            native-type="submit"
            size="large"
            class="login-button"
            :loading="loading"
          >
            <span v-if="!loading">登录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
        
        <div class="register-link">
          <span class="register-text">还没有账号？</span>
          <el-link type="primary" :underline="'never'" @click="$router.push('/register')">
            立即注册
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Reading, Setting } from '@element-plus/icons-vue'
import { login, getCaptcha } from '../api/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  role: 'student',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度为2-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位字符', trigger: 'blur' }
  ]
}

const captchaId = ref('')
const captchaImage = ref('')

const refreshCaptcha = async () => {
  try {
    const response = await getCaptcha()
    if (response.code === 200 && response.data) {
      captchaId.value = response.data.captcha_id
      captchaImage.value = response.data.captcha_image
    } else {
      generateLocalCaptcha()
    }
  } catch {
    generateLocalCaptcha()
  }
}

const generateLocalCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  
  captchaId.value = 'local_' + Date.now()
  const canvas = document.createElement('canvas')
  canvas.width = 120
  canvas.height = 40
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // 绘制背景
    ctx.fillStyle = '#f5f7fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制干扰线
    ctx.strokeStyle = '#e0e0e0'
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }
    
    // 绘制验证码字符
    ctx.font = 'bold 24px Arial'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i < code.length; i++) {
      ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      ctx.save()
      ctx.translate(15 + i * 26, canvas.height / 2)
      ctx.rotate((Math.random() - 0.5) * 0.4)
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }
    
    // 绘制干扰点
    ctx.fillStyle = '#ccc'
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 设置验证码图片（最后才设置，避免中间状态显示空白）
    captchaImage.value = canvas.toDataURL()
    
    // 将验证码存储在本地用于校验（仅降级方案使用）
    localStorage.setItem('local_captcha_' + captchaId.value, code)
  }
}

// 校验本地验证码
const validateLocalCaptcha = (): boolean => {
  if (!captchaId.value.startsWith('local_')) {
    // 不是本地验证码，不需要本地校验
    return true
  }
  
  const storedCode = localStorage.getItem('local_captcha_' + captchaId.value)
  const inputCode = loginForm.captcha.toUpperCase()
  
  if (!storedCode || inputCode !== storedCode) {
    ElMessage.error('验证码错误，请重新输入')
    refreshCaptcha()
    return false
  }
  
  // 清除已使用的验证码
  localStorage.removeItem('local_captcha_' + captchaId.value)
  return true
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    // 如果是本地验证码，先进行本地校验
    if (!validateLocalCaptcha()) {
      return
    }
    
    loading.value = true
    
    const response = await login({
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role
    })
    
    if (response.code === 200 && response.data) {
      const { token, user, role, userId } = response.data
      
      // 获取后端返回的实际角色
      const backendRole = user?.role || role
      
      // 角色校验：后端返回的角色必须与用户选择的角色一致
      if (backendRole && backendRole !== loginForm.role) {
        ElMessage.error(`身份验证失败：您选择的是${loginForm.role === 'student' ? '学生' : loginForm.role === 'teacher' ? '教师' : '管理员'}身份，但系统识别您为${backendRole === 'student' ? '学生' : backendRole === 'teacher' ? '教师' : '管理员'}身份`)
        refreshCaptcha()
        return
      }
      
      // 保存token
      userStore.setToken(token)
      
      // 兼容两种响应格式：{token, user: {...}} 或 {token, role, userId}
      let userInfo = user
      if (!user && role && userId) {
        // 后端返回格式：{token, role, userId}
        userInfo = {
          id: userId,
          role: role,
          username: loginForm.username,
          real_name: loginForm.username,
          email: ''
        }
      }
      userStore.setUserInfo(userInfo)
      
      // 如果勾选了记住密码，保存到localStorage
      if (loginForm.remember) {
        localStorage.setItem('autograder_remember', JSON.stringify({
          username: loginForm.username,
          role: backendRole || loginForm.role
        }))
      } else {
        localStorage.removeItem('autograder_remember')
      }
      
      ElMessage.success('登录成功')
      
      // 根据返回的用户角色跳转，兼容两种响应格式
      const userRole = backendRole || loginForm.role
      
      let redirectPath = '/student/courses'
      switch (userRole) {
        case 'student':
          redirectPath = '/student/courses'
          break
        case 'teacher':
          redirectPath = '/teacher/courses'
          break
        case 'admin':
          redirectPath = '/admin/dashboard'
          break
      }
      
      router.push(redirectPath)
    } else {
      ElMessage.error(response.message || '登录失败')
      refreshCaptcha()
    }
  } catch (error: any) {
    // 后端服务不可用时，显示错误信息
    if (error.message?.includes('Network Error') || 
        error.message?.includes('ERR_CONNECTION_REFUSED') ||
        error.response?.status === 0) {
      ElMessage.error('后端服务不可用，请确保 B4 服务已启动（端口 8000）')
    } else {
      ElMessage.error(error.response?.data?.message || error.message || '登录失败')
    }
    
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshCaptcha()
  
  // 检查是否有记住的账号
  const saved = localStorage.getItem('autograder_remember')
  if (saved) {
    try {
      const { username, role } = JSON.parse(saved)
      loginForm.username = username
      loginForm.role = role
      loginForm.remember = true
    } catch (error) {
      console.error('[Login] 读取记住账号失败:', error)
    }
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 50%, #0E42D2 100%);
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: white;
  top: -200px;
  left: -200px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: white;
  bottom: -100px;
  right: -100px;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xxl);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: var(--spacing-lg);
  position: relative;
  z-index: 1;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.logo-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  border-radius: var(--border-radius-md);
  color: white;
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.login-header h1 {
  color: var(--primary-color);
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.subtitle {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.role-tabs {
  margin-bottom: var(--spacing-lg);
}

.role-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.role-group {
  width: 100%;
  display: flex;
}

.role-group :deep(.el-radio-button) {
  flex: 1;
}

.role-group :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.role-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: var(--border-radius-sm) 0 0 var(--border-radius-sm);
}

.role-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
}

.role-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
}

.role-group :deep(.el-radio-button__inner:hover) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.captcha-container {
  display: flex;
  gap: var(--spacing-md);
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.captcha-image:hover {
  border-color: var(--primary-color);
  transform: scale(1.02);
}

.captcha-char {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 20px;
  color: var(--primary-color);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.captcha-loading {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.remember-checkbox {
  font-size: var(--font-size-sm);
}

.remember-text {
  color: var(--text-secondary);
}

.forgot-link {
  font-size: var(--font-size-sm);
}

.submit-item {
  margin-bottom: var(--spacing-md);
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.4);
}

.register-link {
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.register-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin-right: var(--spacing-xs);
}

@media (max-width: 768px) {
  .login-form-wrapper {
    padding: var(--spacing-xl);
    margin: var(--spacing-md);
    max-width: 100%;
  }
  
  .logo-container {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .login-header h1 {
    font-size: var(--font-size-xl);
  }
  
  .captcha-image {
    width: 100px;
  }
  
  .captcha-char {
    font-size: 16px;
  }
  
  .role-group :deep(.el-radio-button__inner) {
    padding: var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-md);
  }
  
  .login-form-wrapper {
    padding: var(--spacing-lg);
  }
  
  .form-options {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}
</style>
