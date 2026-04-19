<template>
  <div class="coding-container">
    <div class="coding-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="problem-title">
          <span class="title-text">{{ currentProblem.title }}</span>
          <el-tag :type="getDifficultyType(currentProblem.difficulty)" size="small">
            {{ currentProblem.difficulty }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-select v-model="selectedLanguage" placeholder="选择语言" class="language-select" @change="handleLanguageChange">
          <el-option label="Python" value="python">
            <span class="language-option">
              <span class="lang-icon python">🐍</span>
              Python
            </span>
          </el-option>
          <el-option label="Java" value="java">
            <span class="language-option">
              <span class="lang-icon java">☕</span>
              Java
            </span>
          </el-option>
          <el-option label="C++" value="cpp">
            <span class="language-option">
              <span class="lang-icon cpp">⚡</span>
              C++
            </span>
          </el-option>
          <el-option label="JavaScript" value="javascript">
            <span class="language-option">
              <span class="lang-icon js">📜</span>
              JavaScript
            </span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="showHistory = true">
          <el-icon><Clock /></el-icon>
          历史记录
        </el-button>
      </div>
    </div>
    
    <div class="coding-main">
      <div class="problem-panel" :style="{ width: leftPanelWidth + '%' }">
        <div class="panel-tabs">
          <el-radio-group v-model="problemTab" size="small">
            <el-radio-button label="description">题目描述</el-radio-button>
            <el-radio-button label="testcases">测试用例</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="panel-content">
          <template v-if="problemTab === 'description'">
            <div class="problem-description">
              <div class="description-header">
                <h2>{{ currentProblem.title }}</h2>
                <div class="problem-tags">
                  <el-tag v-for="tag in currentProblem.tags" :key="tag" size="small" effect="plain">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              
              <div class="description-body">
                <div class="section">
                  <h3>题目描述</h3>
                  <p>{{ currentProblem.description }}</p>
                </div>
                
                <div class="section">
                  <h3>输入格式</h3>
                  <p>{{ currentProblem.inputFormat }}</p>
                </div>
                
                <div class="section">
                  <h3>输出格式</h3>
                  <p>{{ currentProblem.outputFormat }}</p>
                </div>
                
                <div class="section examples">
                  <h3>示例</h3>
                  <div v-for="(example, index) in currentProblem.examples" :key="index" class="example-block">
                    <div class="example-item">
                      <span class="example-label">输入：</span>
                      <pre class="example-code">{{ example.input }}</pre>
                    </div>
                    <div class="example-item">
                      <span class="example-label">输出：</span>
                      <pre class="example-code">{{ example.output }}</pre>
                    </div>
                  </div>
                </div>
                
                <div class="section constraints">
                  <h3>约束条件</h3>
                  <ul>
                    <li v-for="(constraint, index) in currentProblem.constraints" :key="index">
                      {{ constraint }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="testcases-panel">
              <div class="testcase-tabs">
                <el-radio-group v-model="selectedTestcase" size="small">
                  <el-radio-button v-for="tc in testcases" :key="tc.id" :label="tc.id">
                    用例 {{ tc.id }}
                  </el-radio-button>
                </el-radio-group>
              </div>
              
              <div v-for="tc in testcases" :key="tc.id" v-show="selectedTestcase === tc.id" class="testcase-content">
                <div class="testcase-item">
                  <span class="testcase-label">输入</span>
                  <pre class="testcase-code">{{ tc.input }}</pre>
                </div>
                <div class="testcase-item">
                  <span class="testcase-label">期望输出</span>
                  <pre class="testcase-code">{{ tc.expectedOutput }}</pre>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="resize-handle" @mousedown="startResize"></div>
      </div>
      
      <div class="editor-panel" :style="{ width: (100 - leftPanelWidth) + '%' }">
        <div class="editor-header">
          <span class="editor-title">代码编辑器</span>
          <div class="editor-actions">
            <el-button size="small" @click="resetCode">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
            <el-button size="small" type="primary" plain @click="saveDraft">
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
          </div>
        </div>
        
        <div class="editor-wrapper">
          <div class="line-numbers">
            <span v-for="line in lineCount" :key="line">{{ line }}</span>
          </div>
          <textarea
            v-model="code"
            class="code-editor"
            :placeholder="codePlaceholder"
            @input="handleCodeChange"
            @keydown.tab="handleTab"
            spellcheck="false"
          ></textarea>
        </div>
        
        <div class="editor-footer">
          <div class="code-info">
            <span>行数: {{ lineCount }}</span>
            <span>字符数: {{ code.length }}</span>
          </div>
          <div class="submit-actions">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              :disabled="!code.trim()"
              @click="submitCode"
            >
              <template v-if="submitting">
                <el-icon class="is-loading"><Loading /></el-icon>
                评测中...
              </template>
              <template v-else>
                <el-icon><Position /></el-icon>
                提交代码
              </template>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-drawer
      v-model="showHistory"
      title="提交历史"
      direction="rtl"
      size="400px"
    >
      <div class="history-list">
        <el-card
          v-for="record in submitHistory"
          :key="record.id"
          class="history-card"
          :class="{ 'current': record.id === currentRecordId }"
          @click="loadHistory(record)"
        >
          <div class="history-header">
            <span class="history-time">{{ record.time }}</span>
            <el-tag :type="record.status === 'passed' ? 'success' : 'danger'" size="small">
              {{ record.status === 'passed' ? '通过' : '未通过' }}
            </el-tag>
          </div>
          <div class="history-score">
            <span class="score-label">得分:</span>
            <span class="score-value" :class="getScoreClass(record.score)">{{ record.score }}</span>
            <span class="score-total">/ 100</span>
          </div>
          <div class="history-info">
            <span>{{ record.language }}</span>
            <span class="divider">|</span>
            <span>用时 {{ record.runtime }}ms</span>
          </div>
        </el-card>
      </div>
    </el-drawer>
    
    <el-dialog
      v-model="showResult"
      title="评测结果"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="evaluationResult" class="result-content">
        <div class="result-header">
          <div class="result-status" :class="evaluationResult.passed ? 'passed' : 'failed'">
            <el-icon :size="48">
              <CircleCheck v-if="evaluationResult.passed" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ evaluationResult.passed ? '通过' : '未通过' }}</span>
          </div>
          <div class="result-score">
            <div class="score-circle" :class="getScoreClass(evaluationResult.score)">
              <span class="score-num">{{ evaluationResult.score }}</span>
              <span class="score-unit">分</span>
            </div>
          </div>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-value">{{ evaluationResult.passedCases }}/{{ evaluationResult.totalCases }}</span>
            <span class="stat-label">通过用例</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ evaluationResult.runtime }}ms</span>
            <span class="stat-label">运行时间</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ evaluationResult.memory }}KB</span>
            <span class="stat-label">内存消耗</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">#{{ evaluationResult.ranking }}</span>
            <span class="stat-label">排名</span>
          </div>
        </div>
        
        <div class="result-cases">
          <h3>测试用例详情</h3>
          <div class="cases-list">
            <div
              v-for="(tc, index) in evaluationResult.testCases"
              :key="index"
              class="case-item"
              :class="tc.passed ? 'passed' : 'failed'"
            >
              <div class="case-header">
                <span class="case-name">用例 {{ Number(index) + 1 }}</span>
                <el-tag :type="tc.passed ? 'success' : 'danger'" size="small">
                  {{ tc.passed ? '通过' : '失败' }}
                </el-tag>
              </div>
              <div class="case-details" v-if="!tc.passed">
                <div class="case-row">
                  <span class="case-label">输入:</span>
                  <pre class="case-code">{{ tc.input }}</pre>
                </div>
                <div class="case-row">
                  <span class="case-label">期望输出:</span>
                  <pre class="case-code expected">{{ tc.expectedOutput }}</pre>
                </div>
                <div class="case-row">
                  <span class="case-label">实际输出:</span>
                  <pre class="case-code actual">{{ tc.actualOutput }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showResult = false">关闭</el-button>
        <el-button type="primary" @click="retrySubmit">重新提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  Clock, 
  RefreshRight, 
  Document, 
  Position, 
  Loading,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'

const router = useRouter()
// const route = useRoute()

const leftPanelWidth = ref(40)
const isResizing = ref(false)
const problemTab = ref('description')
const selectedTestcase = ref(1)
const selectedLanguage = ref('python')
const code = ref('')
const submitting = ref(false)
const showHistory = ref(false)
const showResult = ref(false)
const currentRecordId = ref('')
const evaluationResult = ref<any>(null)

const currentProblem = ref({
  id: 'Q001',
  title: '两数之和',
  difficulty: '简单',
  tags: ['数组', '哈希表'],
  description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
  inputFormat: '第一行输入两个整数 n 和 target，分别表示数组长度和目标值。第二行输入 n 个整数，表示数组元素。',
  outputFormat: '输出两个整数，表示两个数的下标（从0开始）。',
  examples: [
    {
      input: '4 9\n2 7 11 15',
      output: '0 1'
    },
    {
      input: '3 6\n3 2 4',
      output: '1 2'
    }
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    '只会存在一个有效答案'
  ]
})

const testcases = ref([
  { id: 1, input: '4 9\n2 7 11 15', expectedOutput: '0 1' },
  { id: 2, input: '3 6\n3 2 4', expectedOutput: '1 2' },
  { id: 3, input: '2 6\n3 3', expectedOutput: '0 1' }
])

const submitHistory = ref([
  { id: 'S001', time: '2026-04-01 14:30', status: 'passed', score: 100, language: 'Python', runtime: 32 },
  { id: 'S002', time: '2026-04-01 14:25', status: 'failed', score: 66, language: 'Python', runtime: 28 },
  { id: 'S003', time: '2026-04-01 14:20', status: 'failed', score: 33, language: 'Python', runtime: 25 }
])

const codeTemplates: Record<string, string> = {
  python: `def two_sum(nums, target):
    # 在此处编写代码
    pass

# 读取输入
n, target = map(int, input().split())
nums = list(map(int, input().split()))

# 调用函数并输出结果
result = two_sum(nums, target)
print(' '.join(map(str, result)))`,
  java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // 在此处编写代码
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // 在此处编写代码
    return {0, 0};
}

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
  javascript: `function twoSum(nums, target) {
    // 在此处编写代码
    return [0, 0];
}

// 读取输入
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    // 处理输入并输出结果
});`
}

const codePlaceholder = computed(() => {
  return `请在此处编写 ${selectedLanguage.value} 代码...`
})

const lineCount = computed(() => {
  return code.value.split('\n').length
})

const getDifficultyType = (difficulty: string): 'success' | 'warning' | 'danger' => {
  switch (difficulty) {
    case '简单': return 'success'
    case '中等': return 'warning'
    case '困难': return 'danger'
    default: return 'warning'
  }
}

const getScoreClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 60) return 'average'
  return 'poor'
}

const handleLanguageChange = (lang: string) => {
  if (!code.value || code.value === codeTemplates[selectedLanguage.value]) {
    code.value = codeTemplates[lang]
  }
  selectedLanguage.value = lang
  ElMessage.success(`已切换到 ${lang}`)
}

const handleCodeChange = () => {
  localStorage.setItem(`code_${currentProblem.value.id}_${selectedLanguage.value}`, code.value)
}

const handleTab = (e: KeyboardEvent) => {
  e.preventDefault()
  const textarea = e.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  code.value = code.value.substring(0, start) + '    ' + code.value.substring(end)
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 4
  }, 0)
}

const startResize = (_e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const container = document.querySelector('.coding-main') as HTMLElement
  if (!container) return
  const containerRect = container.getBoundingClientRect()
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
  leftPanelWidth.value = Math.max(20, Math.min(60, newWidth))
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const resetCode = () => {
  code.value = codeTemplates[selectedLanguage.value]
  ElMessage.success('代码已重置')
}

const saveDraft = () => {
  ElMessage.success('草稿已保存')
}

const submitCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入代码')
    return
  }
  
  submitting.value = true
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const passedCases = Math.floor(Math.random() * 4) + 1
  const totalCases = 3
  const score = Math.round((passedCases / totalCases) * 100)
  
  evaluationResult.value = {
    passed: passedCases === totalCases,
    score,
    passedCases,
    totalCases,
    runtime: Math.floor(Math.random() * 100) + 20,
    memory: Math.floor(Math.random() * 5000) + 1000,
    ranking: Math.floor(Math.random() * 50) + 1,
    testCases: testcases.value.map((tc, index) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: index < passedCases ? tc.expectedOutput : '错误输出',
      passed: index < passedCases
    }))
  }
  
  submitting.value = false
  showResult.value = true
  
  submitHistory.value.unshift({
    id: `S${Date.now()}`,
    time: new Date().toLocaleString('zh-CN'),
    status: passedCases === totalCases ? 'passed' : 'failed',
    score,
    language: selectedLanguage.value,
    runtime: evaluationResult.value.runtime
  })
}

const loadHistory = (record: any) => {
  currentRecordId.value = record.id
  showHistory.value = false
  selectedLanguage.value = record.language
  code.value = codeTemplates[record.language]
  ElMessage.info(`已加载历史记录 ${record.id}`)
}

const retrySubmit = () => {
  showResult.value = false
  submitCode()
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  const savedCode = localStorage.getItem(`code_${currentProblem.value.id}_${selectedLanguage.value}`)
  code.value = savedCode || codeTemplates[selectedLanguage.value]
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.coding-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
}

.coding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.problem-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.language-select {
  width: 140px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.lang-icon {
  font-size: 16px;
}

.coding-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.problem-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  position: relative;
}

.panel-tabs {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color var(--transition-fast);
}

.resize-handle:hover {
  background-color: var(--primary-color);
}

.problem-description {
  color: var(--text-primary);
}

.description-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm) 0;
}

.problem-tags {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.description-body .section {
  margin-bottom: var(--spacing-lg);
}

.description-body h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  padding-left: var(--spacing-sm);
  border-left: 3px solid var(--primary-color);
}

.description-body p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.example-block {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.example-item {
  margin-bottom: var(--spacing-sm);
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.example-code {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.constraints ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.constraints li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.testcases-panel {
  padding: var(--spacing-md) 0;
}

.testcase-tabs {
  margin-bottom: var(--spacing-md);
}

.testcase-content {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.testcase-item {
  margin-bottom: var(--spacing-md);
}

.testcase-item:last-child {
  margin-bottom: 0;
}

.testcase-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.testcase-code {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.editor-title {
  font-size: var(--font-size-sm);
  color: #cccccc;
}

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.editor-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.line-numbers {
  width: 50px;
  background-color: #1e1e1e;
  padding: var(--spacing-md) 0;
  text-align: right;
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: #858585;
  user-select: none;
  overflow: hidden;
}

.line-numbers span {
  display: block;
  padding-right: var(--spacing-sm);
}

.code-editor {
  flex: 1;
  background-color: #1e1e1e;
  border: none;
  outline: none;
  resize: none;
  padding: var(--spacing-md);
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: #d4d4d4;
  tab-size: 4;
}

.code-editor::placeholder {
  color: #6a6a6a;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: #252526;
  border-top: 1px solid #3c3c3c;
}

.code-info {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: #858585;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-card {
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-light);
}

.history-card:hover {
  border-color: var(--primary-color);
}

.history-card.current {
  border-color: var(--primary-color);
  background-color: var(--primary-bg);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.history-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.history-score {
  margin-bottom: var(--spacing-xs);
}

.score-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.score-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--spacing-xs);
}

.score-value.excellent { color: var(--success-color); }
.score-value.good { color: var(--primary-color); }
.score-value.average { color: var(--warning-color); }
.score-value.poor { color: var(--danger-color); }

.score-total {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.history-info {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.history-info .divider {
  margin: 0 var(--spacing-sm);
}

.result-content {
  padding: var(--spacing-md) 0;
}

.result-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xxl);
  margin-bottom: var(--spacing-xl);
}

.result-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.result-status.passed {
  color: var(--success-color);
}

.result-status.failed {
  color: var(--danger-color);
}

.result-status span {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-circle.excellent { background: linear-gradient(135deg, #00B42A 0%, #52C41A 100%); }
.score-circle.good { background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%); }
.score-circle.average { background: linear-gradient(135deg, #FF7D00 0%, #FFA940 100%); }
.score-circle.poor { background: linear-gradient(135deg, #F53F3F 0%, #F76560 100%); }

.score-num {
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.score-unit {
  font-size: var(--font-size-sm);
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xxl);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

.result-cases h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.cases-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
}

.case-item {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.case-item.passed {
  border-left: 4px solid var(--success-color);
}

.case-item.failed {
  border-left: 4px solid var(--danger-color);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
}

.case-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.case-details {
  padding: var(--spacing-md);
}

.case-row {
  margin-bottom: var(--spacing-sm);
}

.case-row:last-child {
  margin-bottom: 0;
}

.case-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.case-code {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
  margin: 0;
  white-space: pre-wrap;
}

.case-code.expected {
  border-left: 3px solid var(--success-color);
}

.case-code.actual {
  border-left: 3px solid var(--danger-color);
}

@media (max-width: 1024px) {
  .coding-main {
    flex-direction: column;
  }
  
  .problem-panel,
  .editor-panel {
    width: 100% !important;
  }
  
  .problem-panel {
    height: 40%;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }
  
  .editor-panel {
    height: 60%;
  }
  
  .resize-handle {
    display: none;
  }
}

@media (max-width: 768px) {
  .coding-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }
  
  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .result-header {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .result-stats {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }
}
</style>
