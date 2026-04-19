# AutoGrader 前端开发规范

## 1. 项目结构

### 1.1 目录结构

```
AutoGrader/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 图片、图标等静态资源
│   ├── components/      # 公共组件
│   │   ├── Form/        # 表单组件
│   │   ├── Modal/       # 弹窗组件
│   │   ├── Table/       # 表格组件
│   │   └── CodeEditor/  # 代码编辑器组件
│   ├── views/           # 页面组件
│   │   ├── student/     # 学生端页面
│   │   ├── teacher/     # 教师端页面
│   │   └── admin/       # 管理员页面
│   ├── services/        # API 服务
│   │   └── api.ts       # Axios 封装
│   ├── stores/          # Pinia 状态管理
│   │   ├── user.ts      # 用户状态
│   │   └── app.ts       # 应用状态
│   ├── router/          # 路由配置
│   │   └── index.ts     # 路由定义
│   ├── styles/          # 全局样式
│   │   └── variables.css # 变量定义
│   ├── mock/            # Mock 数据
│   │   ├── index.ts     # Mock 配置
│   │   ├── user.ts      # 用户 Mock 数据
│   │   ├── course.ts    # 课程 Mock 数据
│   │   ├── assignment.ts # 作业 Mock 数据
│   │   ├── grade.ts     # 成绩 Mock 数据
│   │   └── student.ts   # 学生 Mock 数据
│   ├── main.ts          # 应用入口
│   ├── App.vue          # 根组件
│   └── vite-env.d.ts    # Vite 类型声明
├── docs/                # 文档
├── index.html           # HTML 模板
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## 2. 编码规范

### 2.1 TypeScript 规范

- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型或工具类型
- 避免使用 `any` 类型，尽量使用具体类型
- 为函数参数和返回值添加类型注解
- 使用 `enum` 定义枚举类型

### 2.2 Vue 组件规范

- 使用 Composition API
- 使用 `<script setup lang="ts">` 语法
- 组件命名使用 PascalCase
- 文件名与组件名保持一致
- 组件 props 使用 `withDefaults` 提供默认值
- 事件定义使用 `defineEmits` 并添加类型

### 2.3 命名规范

- 组件名：PascalCase（如 `StudentManagement.vue`）
- 变量名：camelCase（如 `searchKeyword`）
- 常量名：UPPER_CASE（如 `MAX_PAGE_SIZE`）
- 函数名：camelCase（如 `handleFileChange`）
- 类型名：PascalCase（如 `FormItem`）
- 文件名：kebab-case（如 `student-management.vue`）

### 2.4 代码风格

- 使用 2 个空格缩进
- 每行不超过 120 个字符
- 大括号使用 `{` 放在行尾
- 语句结束使用分号
- 字符串使用单引号
- 变量声明使用 `const` 或 `let`，避免使用 `var`

## 3. 组件开发规范

### 3.1 公共组件

- 放在 `src/components/` 目录下
- 每个组件一个文件夹，包含 `index.vue` 文件
- 组件应具有良好的可复用性和可配置性
- 提供清晰的 props 和事件定义
- 组件内部逻辑应与业务逻辑分离

### 3.2 页面组件

- 放在 `src/views/` 目录下，按角色分类
- 页面组件可以包含业务逻辑
- 页面组件应使用公共组件构建
- 页面组件应处理数据获取和状态管理

## 4. 状态管理

- 使用 Pinia 进行状态管理
- 按功能模块拆分 store
- 避免在组件中直接修改 store 状态，使用 actions
- store 应包含 state、getters、actions
- 对于复杂的状态逻辑，应封装在 actions 中

## 5. API 调用规范

- 使用封装的 Axios 实例
- API 调用应在 services 目录中定义
- 对于需要认证的接口，应在请求头中携带 token
- API 调用应使用 async/await 语法
- 错误处理应统一处理

## 6. 路由规范

- 路由配置应包含 meta 信息，如 title、role 等
- 路由守卫应处理权限验证
- 路由路径应使用 kebab-case
- 路由组件应使用懒加载
- 404 页面应作为通配符路由

## 7. 样式规范

- 使用 CSS 变量定义全局样式
- 组件样式使用 scoped
- 避免使用内联样式
- 使用 BEM 命名规范
- 样式类名使用 kebab-case

## 8. 测试规范

- 组件应编写单元测试
- API 调用应编写集成测试
- 测试文件应与被测试文件放在同一目录下，命名为 `*.test.ts`
- 测试应覆盖主要功能和边界情况

## 9. 提交规范

- 提交信息应使用英文
- 提交信息应清晰描述变更内容
- 提交信息格式：`[type]: [description]`
- 类型包括：feat（新功能）、fix（修复 bug）、docs（文档）、style（样式）、refactor（重构）、test（测试）、chore（构建）

## 10. 性能优化

- 使用 v-if 和 v-show 合理选择
- 避免在模板中使用复杂表达式
- 使用 computed 缓存计算结果
- 使用 watch 监听必要的状态变化
- 图片应使用适当的尺寸和格式
- 组件应使用懒加载

## 11. 安全规范

- 避免在前端存储敏感信息
- 接口调用应验证参数
- 避免使用 eval() 等危险函数
- 输入框应进行 XSS 防护
- 密码等敏感信息应加密传输

## 12. 示例代码

### 12.1 组件示例

```vue
<template>
  <div class="example-component">
    <h2>{{ title }}</h2>
    <el-button type="primary" @click="handleClick">点击按钮</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '示例组件'
})

const emit = defineEmits<{
  'click': [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
.example-component {
  padding: var(--spacing-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
}
</style>
```

### 12.2 API 调用示例

```typescript
import api from './api'

// 获取课程列表
export const getCourses = async () => {
  try {
    const response = await api.get('/courses')
    return response
  } catch (error) {
    console.error('获取课程列表失败', error)
    throw error
  }
}

// 提交作业
export const submitAssignment = async (id: string, code: string, language: string) => {
  try {
    const response = await api.post(`/assignments/${id}/submit`, {
      code,
      language
    })
    return response
  } catch (error) {
    console.error('提交作业失败', error)
    throw error
  }
}
```

## 13. 开发工具

- IDE：Visual Studio Code
- 插件：Vetur、ESLint、Prettier
- 构建工具：Vite
- 包管理器：npm
- 版本控制：Git

## 14. 开发流程

1. 从 master 分支创建功能分支
2. 编写代码和测试
3. 运行测试确保通过
4. 提交代码并创建 Pull Request
5. 代码审查
6. 合并到 master 分支
7. 部署到测试环境
8. 测试通过后部署到生产环境

## 15. 常见问题处理

- **TypeScript 类型错误**：检查类型定义是否正确，使用类型断言或类型守卫
- **API 调用失败**：检查网络连接，查看控制台错误信息，验证接口参数
- **组件渲染问题**：检查 props 传递是否正确，查看组件生命周期
- **性能问题**：使用 Vue DevTools 分析组件渲染，优化计算属性和 watch
- **样式问题**：检查 CSS 选择器优先级，使用浏览器开发者工具调试

## 16. 总结

本规范旨在提高前端开发的一致性和可维护性，确保项目代码质量。所有团队成员应遵守本规范，共同维护一个高质量的代码库。