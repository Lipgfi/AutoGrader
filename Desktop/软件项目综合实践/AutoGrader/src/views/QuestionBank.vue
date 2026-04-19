<template>
  <div class="question-bank-container">
    <div class="page-header">
      <h1>题库管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddQuestion">
          <el-icon><Plus /></el-icon>
          新增题目
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出题库
        </el-button>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 左侧分类树 -->
      <el-card class="category-card">
        <template #header>
          <div class="card-header">
            <span>题目分类</span>
            <el-button type="primary" link size="small" @click="handleAddCategory">
              <el-icon><Plus /></el-icon>
              新增分类
            </el-button>
          </div>
        </template>
        
        <el-input
          v-model="categorySearch"
          placeholder="搜索分类"
          prefix-icon="Search"
          clearable
          class="category-search"
        />
        
        <el-tree
          :data="categoryTree"
          :props="treeProps"
          node-key="id"
          :current-node-key="currentCategory"
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleCategoryClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span class="node-label">
                <el-icon v-if="data.children"><Folder /></el-icon>
                <el-icon v-else><Document /></el-icon>
                {{ node.label }}
              </span>
              <span class="node-count">{{ data.count || 0 }}</span>
            </div>
          </template>
        </el-tree>
      </el-card>
      
      <!-- 右侧题目列表 -->
      <div class="question-content">
        <!-- 筛选条件 -->
        <el-card class="filter-card">
          <el-form :model="filterForm" inline class="filter-form">
            <el-form-item label="题目类型">
              <el-select v-model="filterForm.questionType" placeholder="全部类型" clearable>
                <el-option label="编程题" :value="1" />
                <el-option label="选择题" :value="2" />
                <el-option label="填空题" :value="3" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度">
              <el-select v-model="filterForm.difficulty" placeholder="全部难度" clearable>
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="关键词">
              <el-input v-model="filterForm.keyword" placeholder="搜索题目内容" clearable />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 题目列表 -->
        <el-card class="question-list-card">
          <el-table
            :data="questionList"
            v-loading="loading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="题目标题" min-width="200">
              <template #default="scope">
                <div class="question-title">
                  <el-tag :type="getQuestionTypeTag(scope.row.questionType)" size="small">
                    {{ getQuestionTypeName(scope.row.questionType) }}
                  </el-tag>
                  <span class="title-text" @click="viewQuestion(scope.row)">
                    {{ scope.row.title }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="categoryName" label="分类" width="120" />
            <el-table-column prop="difficulty" label="难度" width="100">
              <template #default="scope">
                <el-rate
                  v-model="scope.row.difficulty"
                  disabled
                  :max="3"
                  :colors="['#67C23A', '#E6A23C', '#F56C6C']"
                />
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分值" width="80" />
            <el-table-column prop="useCount" label="使用次数" width="100" sortable />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="editQuestion(scope.row)">
                  编辑
                </el-button>
                <el-button type="primary" link size="small" @click="copyQuestion(scope.row)">
                  复制
                </el-button>
                <el-button type="danger" link size="small" @click="deleteQuestion(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 批量操作 -->
          <div class="batch-actions" v-if="selectedQuestions.length > 0">
            <span class="selected-count">已选择 {{ selectedQuestions.length }} 题</span>
            <el-button size="small" @click="handleBatchEnable">批量启用</el-button>
            <el-button size="small" @click="handleBatchDisable">批量禁用</el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 新增/编辑题目弹窗 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="isEdit ? '编辑题目' : '新增题目'"
      width="800px"
      destroy-on-close
      @close="resetQuestionForm"
    >
      <el-form
        ref="questionFormRef"
        :model="questionForm"
        :rules="questionRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目类型" prop="questionType">
              <el-select v-model="questionForm.questionType" placeholder="请选择题目类型">
                <el-option label="编程题" :value="1" />
                <el-option label="选择题" :value="2" />
                <el-option label="填空题" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类" prop="categoryId">
              <el-cascader
                v-model="questionForm.categoryId"
                :options="categoryOptions"
                :props="{ value: 'id', label: 'name', checkStrictly: true }"
                placeholder="请选择分类"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="questionForm.title" placeholder="请输入题目标题" />
        </el-form-item>
        
        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="questionForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入题目内容"
          />
        </el-form-item>
        
        <!-- 编程题特有字段 -->
        <template v-if="questionForm.questionType === 1">
          <el-form-item label="编程语言">
            <el-checkbox-group v-model="questionForm.languages">
              <el-checkbox label="python">Python</el-checkbox>
              <el-checkbox label="java">Java</el-checkbox>
              <el-checkbox label="cpp">C++</el-checkbox>
              <el-checkbox label="javascript">JavaScript</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item label="测试用例">
            <div class="test-cases">
              <div
                v-for="(testCase, index) in questionForm.testCases"
                :key="index"
                class="test-case-item"
              >
                <div class="case-header">
                  <span>测试用例 {{ index + 1 }}</span>
                  <el-button type="danger" link size="small" @click="removeTestCase(index)">
                    删除
                  </el-button>
                </div>
                <el-input
                  v-model="testCase.input"
                  placeholder="输入"
                  class="case-input"
                />
                <el-input
                  v-model="testCase.expectedOutput"
                  placeholder="预期输出"
                  class="case-output"
                />
              </div>
              <el-button type="primary" link @click="addTestCase">
                <el-icon><Plus /></el-icon>
                添加测试用例
              </el-button>
            </div>
          </el-form-item>
        </template>
        
        <!-- 选择题特有字段 -->
        <template v-if="questionForm.questionType === 2">
          <el-form-item label="选项">
            <div class="options-list">
              <div
                v-for="(option, index) in questionForm.options"
                :key="index"
                class="option-item"
              >
                <el-radio
                  v-model="questionForm.correctOption"
                  :label="index"
                >
                  {{ String.fromCharCode(65 + index) }}
                </el-radio>
                <el-input v-model="option.content" placeholder="选项内容" />
                <el-button type="danger" link @click="removeOption(index)">
                  删除
                </el-button>
              </div>
              <el-button type="primary" link @click="addOption">
                <el-icon><Plus /></el-icon>
                添加选项
              </el-button>
            </div>
          </el-form-item>
        </template>
        
        <!-- 填空题特有字段 -->
        <template v-if="questionForm.questionType === 3">
          <el-form-item label="填空答案">
            <div class="fill-blanks">
              <div
                v-for="(blank, index) in questionForm.fillBlanks"
                :key="index"
                class="blank-item"
              >
                <span class="blank-label">空 {{ index + 1 }}</span>
                <el-input v-model="blank.answer" placeholder="答案" />
                <el-button type="danger" link @click="removeBlank(index)">
                  删除
                </el-button>
              </div>
              <el-button type="primary" link @click="addBlank">
                <el-icon><Plus /></el-icon>
                添加填空
              </el-button>
            </div>
          </el-form-item>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-rate v-model="questionForm.difficulty" :max="3" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值" prop="score">
              <el-input-number v-model="questionForm.score" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-switch
                v-model="questionForm.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="标签">
          <el-select
            v-model="questionForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
          >
            <el-option label="数组" value="数组" />
            <el-option label="链表" value="链表" />
            <el-option label="树" value="树" />
            <el-option label="图" value="图" />
            <el-option label="排序" value="排序" />
            <el-option label="查找" value="查找" />
            <el-option label="动态规划" value="动态规划" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="参考答案">
          <el-input
            v-model="questionForm.answer"
            type="textarea"
            :rows="4"
            placeholder="请输入参考答案"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestion">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 查看题目详情弹窗 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="题目详情"
      width="700px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentQuestion">
        <el-descriptions-item label="题目ID">{{ currentQuestion.id }}</el-descriptions-item>
        <el-descriptions-item label="题目类型">
          <el-tag :type="getQuestionTypeTag(currentQuestion.questionType)">
            {{ getQuestionTypeName(currentQuestion.questionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属分类">{{ currentQuestion.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="难度">
          <el-rate v-model="currentQuestion.difficulty" disabled :max="3" />
        </el-descriptions-item>
        <el-descriptions-item label="分值">{{ currentQuestion.score }}分</el-descriptions-item>
        <el-descriptions-item label="使用次数">{{ currentQuestion.useCount }}次</el-descriptions-item>
        <el-descriptions-item label="题目标题" :span="2">{{ currentQuestion.title }}</el-descriptions-item>
        <el-descriptions-item label="题目内容" :span="2">
          <div class="question-content-preview">{{ currentQuestion.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="tag in currentQuestion.tags" :key="tag" class="tag-item">
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="参考答案" :span="2">
          <div class="answer-preview">{{ currentQuestion.answer }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editQuestion(currentQuestion)">编辑</el-button>
        <el-button @click="createHomeworkFromQuestion(currentQuestion)">创建作业</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增分类弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      title="新增分类"
      width="400px"
      destroy-on-close
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="categoryForm.parentId"
            :options="categoryTree"
            :props="{ value: 'id', label: 'name', checkStrictly: true }"
            placeholder="请选择父级分类"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Folder, 
  Document 
} from '@element-plus/icons-vue'

const loading = ref(false)
const categorySearch = ref('')
const currentCategory = ref<number | null>(null)
const questionDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const isEdit = ref(false)
const currentQuestion = ref<any>(null)
const selectedQuestions = ref<any[]>([])

const filterForm = reactive({
  questionType: null as number | null,
  difficulty: null as number | null,
  status: null as number | null,
  keyword: ''
})

const treeProps = {
  children: 'children',
  label: 'name'
}

const categoryTree = ref([
  {
    id: 1,
    name: '全部题目',
    count: 156,
    children: [
      { id: 11, name: 'Python编程', count: 45 },
      { id: 12, name: '数据结构', count: 38 },
      { id: 13, name: '算法设计', count: 32 },
      { id: 14, name: '数据库', count: 25 },
      { id: 15, name: '计算机网络', count: 16 }
    ]
  }
])

const categoryOptions = ref([
  { id: 11, name: 'Python编程' },
  { id: 12, name: '数据结构' },
  { id: 13, name: '算法设计' },
  { id: 14, name: '数据库' },
  { id: 15, name: '计算机网络' }
])

const questionList = ref([
  {
    id: 1,
    title: '两数之和',
    content: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
    questionType: 1,
    categoryName: '算法设计',
    difficulty: 1,
    score: 10,
    useCount: 25,
    status: 1,
    createTime: '2024-01-15 10:30',
    tags: ['数组', '哈希表'],
    answer: '使用哈希表存储已遍历的元素及其索引，遍历数组时检查 target - nums[i] 是否在哈希表中。'
  },
  {
    id: 2,
    title: '反转链表',
    content: '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。',
    questionType: 1,
    categoryName: '数据结构',
    difficulty: 2,
    score: 15,
    useCount: 18,
    status: 1,
    createTime: '2024-01-16 14:20',
    tags: ['链表'],
    answer: '使用迭代或递归方法，逐个反转链表节点的指针方向。'
  },
  {
    id: 3,
    title: '以下哪个是Python中的不可变数据类型？',
    content: '请选择正确的答案。',
    questionType: 2,
    categoryName: 'Python编程',
    difficulty: 1,
    score: 5,
    useCount: 30,
    status: 1,
    createTime: '2024-01-17 09:15',
    tags: ['Python', '基础'],
    answer: 'B'
  },
  {
    id: 4,
    title: 'SQL中用于删除表的语句是______',
    content: '请填写正确的SQL语句。',
    questionType: 3,
    categoryName: '数据库',
    difficulty: 1,
    score: 5,
    useCount: 22,
    status: 1,
    createTime: '2024-01-18 16:45',
    tags: ['SQL', '基础'],
    answer: 'DROP TABLE'
  }
])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 156
})

const questionFormRef = ref()
const questionForm = reactive({
  questionType: 1,
  categoryId: null as number | null,
  title: '',
  content: '',
  difficulty: 1,
  score: 10,
  status: 1,
  tags: [] as string[],
  answer: '',
  languages: ['python'],
  testCases: [{ input: '', expectedOutput: '' }],
  options: [
    { content: '' },
    { content: '' },
    { content: '' },
    { content: '' }
  ],
  correctOption: 0,
  fillBlanks: [{ answer: '' }]
})

const questionRules = {
  questionType: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }]
}

const categoryForm = reactive({
  name: '',
  parentId: null as number | null,
  sort: 0
})

const getQuestionTypeName = (type: number): string => {
  const types: Record<number, string> = { 1: '编程题', 2: '选择题', 3: '填空题' }
  return types[type] || '未知'
}

const getQuestionTypeTag = (type: number): 'primary' | 'success' | 'warning' => {
  const tags: Record<number, 'primary' | 'success' | 'warning'> = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return tags[type] || 'primary'
}

const handleCategoryClick = (data: any) => {
  currentCategory.value = data.id
  handleSearch()
}

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetFilter = () => {
  filterForm.questionType = null
  filterForm.difficulty = null
  filterForm.status = null
  filterForm.keyword = ''
}

const handleAddQuestion = () => {
  isEdit.value = false
  questionDialogVisible.value = true
}

const editQuestion = (row: any) => {
  isEdit.value = true
  currentQuestion.value = row
  Object.assign(questionForm, {
    ...row,
    testCases: [{ input: '', expectedOutput: '' }],
    options: [
      { content: '' },
      { content: '' },
      { content: '' },
      { content: '' }
    ],
    correctOption: 0,
    fillBlanks: [{ answer: '' }]
  })
  questionDialogVisible.value = true
}

const viewQuestion = (row: any) => {
  currentQuestion.value = row
  viewDialogVisible.value = true
}

const copyQuestion = (row: any) => {
  ElMessage.success(`题目"${row.title}"已复制`)
}

const deleteQuestion = (row: any) => {
  ElMessageBox.confirm(`确定要删除题目"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中移除题目
    const index = questionList.value.findIndex(q => q.id === row.id)
    if (index > -1) {
      questionList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  })
}

const handleStatusChange = (row: any) => {
  ElMessage.success(`题目已${row.status === 1 ? '启用' : '禁用'}`)
}

const handleSelectionChange = (selection: any[]) => {
  selectedQuestions.value = selection
}

const handleBatchEnable = () => {
  ElMessage.success('批量启用成功')
}

const handleBatchDisable = () => {
  ElMessage.success('批量禁用成功')
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const addTestCase = () => {
  questionForm.testCases.push({ input: '', expectedOutput: '' })
}

const removeTestCase = (index: number) => {
  questionForm.testCases.splice(index, 1)
}

const addOption = () => {
  questionForm.options.push({ content: '' })
}

const removeOption = (index: number) => {
  questionForm.options.splice(index, 1)
}

const addBlank = () => {
  questionForm.fillBlanks.push({ answer: '' })
}

const removeBlank = (index: number) => {
  questionForm.fillBlanks.splice(index, 1)
}

const resetQuestionForm = () => {
  Object.assign(questionForm, {
    questionType: 1,
    categoryId: null,
    title: '',
    content: '',
    difficulty: 1,
    score: 10,
    status: 1,
    tags: [],
    answer: '',
    languages: ['python'],
    testCases: [{ input: '', expectedOutput: '' }],
    options: [
      { content: '' },
      { content: '' },
      { content: '' },
      { content: '' }
    ],
    correctOption: 0,
    fillBlanks: [{ answer: '' }]
  })
}

const saveQuestion = () => {
  questionFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      questionDialogVisible.value = false
    }
  })
}

const handleAddCategory = () => {
  categoryDialogVisible.value = true
}

const saveCategory = () => {
  ElMessage.success('分类添加成功')
  categoryDialogVisible.value = false
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const createHomeworkFromQuestion = (question: any) => {
  ElMessage.success(`已基于题目"${question.title}"创建作业`)
  viewDialogVisible.value = false
}
</script>

<style scoped>
.question-bank-container {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.main-content {
  display: flex;
  gap: var(--spacing-lg);
}

.category-card {
  width: 280px;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-search {
  margin-bottom: var(--spacing-md);
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: var(--spacing-sm);
}

.node-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.node-count {
  background-color: var(--primary-light);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: var(--font-size-xs);
}

.question-content {
  flex: 1;
  min-width: 0;
}

.filter-card {
  margin-bottom: var(--spacing-md);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.question-list-card {
  margin-bottom: var(--spacing-md);
}

.question-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-text {
  cursor: pointer;
  color: var(--primary-color);
}

.title-text:hover {
  text-decoration: underline;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-light);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
}

.selected-count {
  color: var(--primary-color);
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.test-cases {
  width: 100%;
}

.test-case-item {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.case-input,
.case-output {
  margin-bottom: var(--spacing-sm);
}

.options-list {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.option-item .el-input {
  flex: 1;
}

.fill-blanks {
  width: 100%;
}

.blank-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.blank-label {
  width: 50px;
  font-weight: 500;
}

.blank-item .el-input {
  flex: 1;
}

.question-content-preview,
.answer-preview {
  white-space: pre-wrap;
  word-break: break-all;
}

.tag-item {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .category-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .question-bank-container {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
}
</style>