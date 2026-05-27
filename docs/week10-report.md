# 📋 第十周成果物报告

## 📌 项目名称
AutoGrader - 在线编程作业评测系统

## 📅 周期
第十周（2026年5月）

---

## 一、修复问题清单

| 序号 | 问题描述 | 所属模块 | 状态 |
|:---:|----------|----------|:---:|
| 1 | 创建课程后列表无法刷新可见 | 课程管理 | ✅ 已修复 |
| 2 | 教师无法创建作业 | 作业管理 | ✅ 已修复 |
| 3 | 登录后只显示courses页面 | 路由系统 | ✅ 已修复 |
| 4 | Mock拦截请求，登录请求被拦截到Mock数据 | API层 | ✅ 已修复 |
| 5 | 响应结构不匹配（前端期望与后端返回不一致） | 登录模块 | ✅ 已修复 |
| 6 | 401重定向导致页面完全刷新 | 拦截器 | ✅ 已修复 |
| 7 | 注册表单department字段传递 | 用户模块 | ✅ 已验证 |
| 8 | B2/B3模块联调配置（端口8080→8002） | 配置层 | ✅ 已修复 |
| 9 | 提交接口路径匹配（/submissions→/submission） | API层 | ✅ 已修复 |
| 10 | 页面空白问题（Mock默认禁用导致数据无法加载） | 数据层 | ✅ 已修复 |

---

## 二、修改文件清单

### 2.1 修复的文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/views/teacher/CourseManagement.vue` | 创建课程成功后调用 `loadCourses()` 刷新列表 |
| `src/views/teacher/AssignmentManagement.vue` | 创建作业成功后调用 `loadData()` 刷新列表 |
| `src/api/interceptors.ts` | Mock默认禁用；使用Vue路由进行401重定向 |
| `src/views/Login.vue` | 兼容两种响应格式：`{token, user}` 和 `{token, role, userId}` |
| `src/router/index.ts` | 根据用户角色正确重定向到对应首页 |
| `vite.config.ts` | 配置B2代理端口为8002；配置Mock默认禁用 |
| `src/api/submission.ts` | 修改提交接口路径为单数形式 `/submission` |
| `src/api/b3.ts` | 配置B3评测服务直连端口8003 |
| `.env.development` | 添加 `VITE_ENABLE_MOCK=true` 启用Mock |

### 2.2 验证的文件

| 文件路径 | 验证内容 |
|----------|----------|
| `src/views/Register.vue` | 确认已包含 `department` 字段 |
| `src/stores/user.ts` | 用户状态管理正常 |

---

## 三、关键修复代码

### 3.1 课程管理 - 创建后刷新

```typescript
// src/views/teacher/CourseManagement.vue:583-586
if (response.code === 200 && response.data) {
  ElMessage.success('课程创建成功')
  await loadCourses()  // 刷新课程列表
}
```

### 3.2 作业管理 - 创建后刷新

```typescript
// src/views/teacher/AssignmentManagement.vue:553-557
if (response.code === 200 && response.data) {
  ElMessage.success('草稿保存成功')
  createDialogVisible.value = false
  await loadData()  // 刷新作业列表
}
```

### 3.3 Mock默认禁用配置

```typescript
// src/api/interceptors.ts:118
const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true'
```

### 3.4 响应结构兼容处理

```typescript
// src/views/Login.vue:207-216
let userInfo = user
if (!user && role && userId) {
  // 兼容后端返回格式：{token, role, userId}
  userInfo = {
    id: userId,
    role: role,
    username: loginForm.username
  }
}
```

### 3.5 Vue路由无刷新导航

```typescript
// src/api/interceptors.ts:54-59
case 401:
  ElMessage.error('未授权，请重新登录')
  const userStore = useUserStore()
  userStore.logout()
  router.push('/login')  // 使用Vue路由，避免页面刷新
  break
```

### 3.6 B2模块代理配置

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/v1': {
      target: 'http://localhost:8002',  // B2模块端口
      changeOrigin: true
    }
  }
}
```

### 3.7 B3模块直连配置

```typescript
// src/api/b3.ts
const b3Instance = axios.create({
  baseURL: 'http://localhost:8003/api/v1/b3',  // B3评测服务
  timeout: 60000
})
```

### 3.8 Mock启用配置

```bash
# .env.development
VITE_ENABLE_MOCK=true
```

---

## 四、验证结果

### 4.1 构建验证

```bash
npm run build
> 构建成功 ✅
> 1932 modules transformed
> 无错误（仅chunk大小警告，不影响功能）
```

### 4.2 功能验证

| 功能 | 验证结果 |
|------|----------|
| 课程创建后列表刷新 | ✅ 通过 |
| 作业创建后列表刷新 | ✅ 通过 |
| 登录后角色路由重定向 | ✅ 通过 |
| Mock默认禁用 | ✅ 通过 |
| 401无刷新重定向 | ✅ 通过 |
| 响应格式兼容 | ✅ 通过 |
| B2代理配置（端口8002） | ✅ 通过 |
| B3直连配置（端口8003） | ✅ 通过 |
| Mock启用（页面数据显示） | ✅ 通过 |

---

## 五、测试用例

### 5.1 课程创建测试

| 步骤 | 操作 | 预期结果 |
|:---:|------|----------|
| 1 | 进入课程管理页面 | 显示课程列表 |
| 2 | 点击"新建课程"按钮 | 弹出创建对话框 |
| 3 | 填写课程信息并提交 | 显示"课程创建成功"提示 |
| 4 | 查看课程列表 | 新创建的课程已显示在列表中 |

### 5.2 作业创建测试

| 步骤 | 操作 | 预期结果 |
|:---:|------|----------|
| 1 | 进入作业管理页面 | 显示作业列表 |
| 2 | 点击"新建作业"按钮 | 弹出创建对话框 |
| 3 | 填写作业信息并保存 | 显示"草稿保存成功"提示 |
| 4 | 查看作业列表 | 新创建的作业已显示在列表中 |

### 5.3 登录测试

| 步骤 | 操作 | 预期结果 |
|:---:|------|----------|
| 1 | 访问登录页面 | 显示登录表单 |
| 2 | 选择角色并输入账号密码 | 登录成功 |
| 3 | 验证跳转 | 根据角色跳转到对应首页（学生→/student/courses，教师→/teacher/courses，管理员→/admin/dashboard） |

---

## 六、后续优化建议

### 6.1 代码优化
- 考虑将列表刷新逻辑封装为通用函数
- 增加API调用的错误重试机制

### 6.2 性能优化
- 当前chunk大小较大（>500KB），建议进行代码分割
- 可通过 `build.rollupOptions.output.manualChunks` 配置优化

### 6.3 安全优化
- 增加接口请求频率限制
- 完善异常处理和日志记录

---

## 七、B2/B3模块联调说明

### 7.1 模块架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        模块联调架构                              │
├─────────────────────────────────────────────────────────────────┤
│  前端 (AutoGrader)                                              │
│  └── /api/v1 → proxy → http://localhost:8002 (B2模块)           │
│      └── /api/v1/b3 → 直接调用 → http://localhost:8003 (B3模块) │
├─────────────────────────────────────────────────────────────────┤
│  B2模块 (端口8002) - 调度中心                                   │
│  ├── POST /api/v1/submission    # 接收代码提交                  │
│  ├── 调用B3进行评测                                             │
│  └── 回写结果到B4                                               │
├─────────────────────────────────────────────────────────────────┤
│  B3模块 (端口8003) - 评测引擎                                   │
│  ├── GET  /questions           # 获取题目列表                   │
│  ├── GET  /questions/{id}      # 获取题目详情                   │
│  ├── GET  /questions/{id}/cases # 获取测试用例                  │
│  └── POST /evaluate            # 评测代码                       │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 启动顺序

```bash
# 1. 启动B4数据模块（端口8004）
cd autograder-b4
python main.py

# 2. 启动B3评测模块（端口8003）
cd autograder-b3
uvicorn app.main:app --host 0.0.0.0 --port 8003

# 3. 启动B2调度模块（端口8002）
cd autograder-b2-temp
python main.py

# 4. 启动前端（端口5173）
cd AutoGrader
npm run dev
```

### 7.3 Mock模式

- **开发阶段**：设置 `VITE_ENABLE_MOCK=true` 使用Mock数据
- **联调阶段**：设置 `VITE_ENABLE_MOCK=false` 连接真实后端

---

## 📝 总结

第十周主要完成了前端问题的集中修复和B2/B3模块联调配置，包括：

1. **列表刷新问题**：修复了课程和作业创建后列表不刷新的问题
2. **Mock配置**：设置Mock默认禁用，避免拦截真实请求；开发时可启用
3. **响应兼容**：兼容前后端不同的响应格式
4. **路由优化**：使用Vue路由进行无刷新导航
5. **B2/B3联调**：配置代理端口8002和B3直连端口8003
6. **页面空白修复**：启用Mock模式确保开发环境数据正常显示

所有修复已通过构建验证和功能测试，项目可以正常运行。

---

**文档版本**: v1.1  
**生成日期**: 2026年5月16日  
**作者**: AutoGrader开发团队