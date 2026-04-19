<template>
  <div class="register-container">
    <div class="register-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
    </div>
    
    <div class="register-form-wrapper">
      <div class="register-header">
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
        <p class="subtitle">创建新账号</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <div class="role-tabs">
          <div class="role-label">选择身份</div>
          <el-radio-group v-model="registerForm.role" class="role-group">
            <el-radio-button label="student">
              <el-icon><User /></el-icon>
              <span>学生</span>
            </el-radio-button>
            <el-radio-button label="teacher">
              <el-icon><Reading /></el-icon>
              <span>教师</span>
            </el-radio-button>
            <el-radio-button label="admin">
              <el-icon><Setting /></el-icon>
              <span>管理员</span>
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入学号/工号/账号"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（6-20位）"
            prefix-icon="Lock"
            show-password
            size="large"
          />
          <div class="password-strength" v-if="registerForm.password">
            <span class="strength-label">密码强度：</span>
            <div class="strength-bar">
              <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
            </div>
            <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
          </div>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Check"
            show-password
            size="large"
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="registerForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Picture"
              size="large"
              class="captcha-input"
              @keyup.enter="handleRegister"
            />
            <div class="captcha-image" @click="refreshCaptcha" :title="'点击刷新验证码'">
              <span class="captcha-char" v-for="(char, index) in captchaCode.split('')" :key="index" :style="{ transform: `rotate(${Math.random() * 20 - 10}deg)` }">
                {{ char }}
              </span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item class="submit-item">
          <el-button
            type="primary"
            native-type="submit"
            size="large"
            class="register-button"
            :loading="loading"
          >
            <span v-if="!loading">注册</span>
            <span v-else>注册中...</span>
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          <span class="login-text">已有账号？</span>
          <el-link type="primary" :underline="false" @click="$router.push('/login')">
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Reading, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  role: 'student'
})

const registerRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为4-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位字符', trigger: 'blur' }
  ]
}

const captchaCode = ref('')

const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 6) strength += 1
  if (password.length >= 10) strength += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1
  if (/\d/.test(password)) strength += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1
  
  return Math.min(strength, 4)
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'weak'
  if (strength <= 2) return 'medium'
  if (strength <= 3) return 'good'
  return 'strong'
})

const passwordStrengthWidth = computed(() => {
  return `${passwordStrength.value * 25}%`
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return '弱'
  if (strength <= 2) return '中'
  if (strength <= 3) return '良'
  return '强'
})

const generateCaptcha = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha()
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    if (registerForm.captcha.toUpperCase() !== captchaCode.value) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }
    
    loading.value = true
    
    setTimeout(() => {
      loading.value = false
      ElMessage.success('注册成功')
      router.push('/login')
    }, 1000)
  } catch (error) {
    loading.value = false
    console.error('注册表单校验失败', error)
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 50%, #0E42D2 100%);
  position: relative;
  overflow: hidden;
}

.register-background {
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

.register-form-wrapper {
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

.register-header {
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

.register-header h1 {
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

.password-strength {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.strength-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: all var(--transition-normal);
}

.strength-fill.weak {
  background-color: var(--danger-color);
}

.strength-fill.medium {
  background-color: var(--warning-color);
}

.strength-fill.good {
  background-color: #4080FF;
}

.strength-fill.strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.strength-text.weak {
  color: var(--danger-color);
}

.strength-text.medium {
  color: var(--warning-color);
}

.strength-text.good {
  color: #4080FF;
}

.strength-text.strong {
  color: var(--success-color);
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

.submit-item {
  margin-bottom: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.4);
}

.login-link {
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.login-text {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  margin-right: var(--spacing-xs);
}

@media (max-width: 768px) {
  .register-form-wrapper {
    padding: var(--spacing-xl);
    margin: var(--spacing-md);
    max-width: 100%;
  }
  
  .logo-container {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .register-header h1 {
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
  .register-container {
    padding: var(--spacing-md);
  }
  
  .register-form-wrapper {
    padding: var(--spacing-lg);
  }
}
</style>
