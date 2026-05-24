<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
    <div class="decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 50%, #0E42D2 100%);
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  z-index: 1;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-code {
  font-size: 160px;
  font-weight: var(--font-weight-bold);
  color: white;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: var(--spacing-md);
}

h1 {
  font-size: var(--font-size-xxl);
  color: white;
  margin: 0 0 var(--spacing-md) 0;
  font-weight: var(--font-weight-semibold);
}

.error-message {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 var(--spacing-xl) 0;
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: white;
  opacity: 0.1;
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  right: -50px;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 100px;
  }
  
  h1 {
    font-size: var(--font-size-xl);
  }
  
  .error-message {
    font-size: var(--font-size-base);
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
