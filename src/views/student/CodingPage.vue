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
              <span class="lang-icon">Python</span>
              Python
            </span>
          </el-option>
          <el-option label="Java" value="java">
            <span class="language-option">
              <span class="lang-icon">Java</span>
              Java
            </span>
          </el-option>
          <el-option label="C++" value="cpp">
            <span class="language-option">
              <span class="lang-icon">C++</span>
              C++
            </span>
          </el-option>
          <el-option label="JavaScript" value="javascript">
            <span class="language-option">
              <span class="lang-icon">JS</span>
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
                      <span class="example-label">输入</span>
                      <pre class="example-code">{{ example.input }}</pre>
                    </div>
                    <div class="example-item">
                      <span class="example-label">输出</span>
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
          <div v-if="record.id === currentRecordId && record.code" class="history-code">
            <pre class="code-preview">{{ record.code }}</pre>
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { getQuestionDetail } from '../../api/question'
import { evaluateSubmission, getB3QuestionCases } from '../../api/b3'
import { createSubmission, updateSubmissionResult } from '../../api/submission'
import { getAssignments } from '../../api/assignment'
import { request } from '../../api/interceptors'
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
const route = useRoute()
const userStore = useUserStore()

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
const questionId = ref('')

const currentProblem = ref<any>({
  id: '',
  title: '加载中...',
  difficulty: '',
  tags: [],
  description: '',
  inputFormat: '',
  outputFormat: '',
  examples: [],
  constraints: [],
  testcases: []
})
const testcases = ref<any[]>([])
const submitHistory = ref<any[]>([])

const lineCount = computed(() => {
  return code.value.split('\n').length
})

const codePlaceholder = computed(() => {
  return codeTemplates[selectedLanguage.value] || ''
})

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
        return new int[2];
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int target = scanner.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt();
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
    return {};
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
  javascript: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function twoSum(nums, target) {
    // 在此处编写代码
    return [];
}

let input = [];
rl.on('line', (line) => {
    input.push(line);
    if (input.length === 2) {
        const [n, target] = input[0].split(' ').map(Number);
        const nums = input[1].split(' ').map(Number);
        const result = twoSum(nums, target);
        console.log(result.join(' '));
        rl.close();
    }
});`
}

const goBack = () => {
  router.back()
}

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, string> = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return types[difficulty] || 'info'
}

const getScoreClass = (score: number) => {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

const handleLanguageChange = () => {
  code.value = codeTemplates[selectedLanguage.value] || ''
}

const handleCodeChange = () => {
}

const handleTab = (e: KeyboardEvent) => {
  e.preventDefault()
  const textarea = e.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  code.value = code.value.substring(0, start) + '  ' + code.value.substring(end)
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 2
  }, 0)
}

const resetCode = () => {
  code.value = codeTemplates[selectedLanguage.value] || ''
}

const saveDraft = () => {
  localStorage.setItem(`draft_${questionId.value}_${selectedLanguage.value}`, code.value)
  ElMessage.success('草稿已保存')
}

const loadQuestion = async () => {
  try {
    const resolvedQId = route.params.id || 'Q001'
    questionId.value = resolvedQId as string
    console.log('[CodingPage] 请求题目详情:', questionId.value)
    
    // 尝试从 B3 题库获取题目
    try {
      const b3Response = await getB3QuestionCases(resolvedQId as string)
      // B3 拦截器返回 response.data，所以 b3Response 就是实际数据
      if (b3Response && (b3Response.data || b3Response.test_cases)) {
        const questionData = b3Response.data || b3Response
        currentProblem.value = {
          id: resolvedQId as string,
          title: questionData.title || questionData.question_title || `题目 ${resolvedQId}`,
          difficulty: questionData.difficulty || '中等',
          tags: questionData.tags || [],
          description: questionData.description || '',
          inputFormat: questionData.input_format || questionData.inputFormat || '',
          outputFormat: questionData.output_format || questionData.outputFormat || '',
          examples: [],
          constraints: [],
          testcases: ((questionData.test_cases || questionData.testCases) || []).map((tc: any, index: number) => ({
            id: index + 1,
            input: tc.input || '',
            expectedOutput: tc.expected_output || tc.expectedOutput || tc.output || ''
          }))
        }
        if (questionData.language) {
          selectedLanguage.value = questionData.language
        }
        testcases.value = currentProblem.value.testcases
        selectedTestcase.value = testcases.value[0]?.id || 1
        console.log('[CodingPage] 从 B3 加载题目成功:', resolvedQId)
        return
      }
    } catch (b3Error) {
      console.warn('[CodingPage] B3 题库接口不可用，尝试 B4 接口:', b3Error)
    }
    
    // 从 B4 主后端获取题目详情
    const response = await getQuestionDetail(resolvedQId as string)
    
    // B4 使用统一拦截器，返回 {code, data, message}
    if (response && response.code === 200 && response.data) {
      const question = response.data
      currentProblem.value = {
        id: question.id || resolvedQId,
        title: question.title || `题目 ${resolvedQId}`,
        difficulty: question.difficulty || '中等',
        tags: question.tags || [],
        description: question.description || '',
        inputFormat: question.inputFormat || '',
        outputFormat: question.outputFormat || '',
        examples: question.examples || [],
        constraints: question.constraints || [],
        testcases: (question.testCases || question.testcases || []).map((tc: any, index: number) => ({
          id: tc.id || index + 1,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || tc.expected_output || tc.output || ''
        }))
      }
      if (question.language) {
        selectedLanguage.value = question.language
      }
      testcases.value = currentProblem.value.testcases
      selectedTestcase.value = testcases.value[0]?.id || 1
      console.log('[CodingPage] 从 B4 加载题目成功:', currentProblem.value.title)
    } else {
      // B4 也没有题目，显示错误提示
      currentProblem.value = {
        id: resolvedQId as string,
        title: '题目加载失败',
        difficulty: '',
        tags: [],
        description: `未能加载题目 "${resolvedQId}"。请确保后端服务（B4 端口 8000）已启动。`,
        inputFormat: '',
        outputFormat: '',
        examples: [],
        constraints: [],
        testcases: []
      }
      testcases.value = []
      ElMessage.error('未找到该题目，请确保 B4 服务已启动（端口 8000）')
    }
  } catch (error: any) {
    console.error('[CodingPage] 加载题目失败:', error)
    currentProblem.value = {
      id: '',
      title: '加载失败',
      difficulty: '',
      tags: [],
      description: `加载题目时发生错误: ${error.message || '未知错误'}。请确保后端服务已启动。`,
      inputFormat: '',
      outputFormat: '',
      examples: [],
      constraints: [],
      testcases: []
    }
    testcases.value = []
    ElMessage.error('加载题目失败，请确保后端服务已启动')
  }
}

const submitCode = async () => {
  if (!code.value.trim()) {
    ElMessage.warning('请输入代码')
    return
  }

  submitting.value = true

  let submissionId = ''

  try {
    // 1. 通过 API 查询当前题目对应的 assignment_id
    let assignmentId = ''
    try {
      const asgnRes = await getAssignments()
      if (asgnRes.code === 200 && asgnRes.data) {
        const match = (asgnRes.data || []).find((a: any) => a.question_id === questionId.value)
        if (match) {
          assignmentId = String(match.assignment_id || match.id)
        }
      }
    } catch (e) { /* ignore */ }
    console.log('[CodingPage] questionId:', questionId.value, 'assignmentId:', assignmentId)

    if (assignmentId) {
      try {
        const createRes = await createSubmission({
          question_id: questionId.value,
          assignment_id: Number(assignmentId),
          code: code.value,
          language: selectedLanguage.value,
          student_user_id: Number(userStore.userId)
        })
        submissionId = createRes?.data?.submission_id || ''
        console.log('[CodingPage] 提交记录已创建:', submissionId)
      } catch (e: any) {
        console.error('[CodingPage] 创建提交记录失败:', e?.response?.status, e?.response?.data || e)
      }
    } else {
      console.warn('[CodingPage] 未找到对应作业，跳过创建提交记录')
    }

    // 2. 调用 B3 评测
    const result = await evaluateSubmission({
      question_id: questionId.value,
      submitted_code: code.value,
      submission_id: submissionId || Date.now().toString(),
      language: selectedLanguage.value
    })

    const b3Result = result as any
    evaluationResult.value = {
      passed: b3Result.passed_count === b3Result.total_count,
      score: b3Result.overall_score || 0,
      passedCases: b3Result.passed_count || 0,
      totalCases: b3Result.total_count || 0,
      runtime: b3Result.runtime || 0,
      memory: b3Result.memory || 0,
      ranking: b3Result.ranking || 0,
      testCases: (b3Result.case_results || []).map((cr: any) => ({
        input: cr.input || '',
        expectedOutput: cr.expected_output || '',
        actualOutput: cr.actual_output || '',
        passed: cr.passed
      }))
    }

    submitHistory.value.unshift({
      id: submissionId || Date.now().toString(),
      time: new Date().toLocaleString(),
      status: evaluationResult.value?.passed ? 'passed' : 'failed',
      score: b3Result.overall_score || 0,
      language: selectedLanguage.value,
      runtime: b3Result.runtime || 0
    })

    // 3. 将 B3 评测结果更新到 B4 提交记录
    if (submissionId) {
      try {
        await updateSubmissionResult(submissionId, {
          status: 'COMPLETED',
          overallScore: b3Result.overall_score || 0,
          passedCount: b3Result.passed_count || 0,
          totalCount: b3Result.total_count || 0,
          overallComment: b3Result.overall_comment || '',
          staticIssues: b3Result.static_issues || [],
          caseResults: (b3Result.case_results || []).map((cr: any) => ({
            case_id: cr.case_id || '',
            passed: cr.passed,
            input: cr.input || '',
            expected_output: cr.expected_output || '',
            actual_output: cr.actual_output || '',
            score: cr.score || 0
          }))
        })
        console.log('[CodingPage] 评测结果已更新到数据库')
      } catch (e) {
        console.error('[CodingPage] 更新评测结果失败:', e)
      }
    }

    showResult.value = true
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试')
    console.error('[CodingPage] 提交代码失败:', error)
  } finally {
    submitting.value = false
  }
}

const loadHistory = (record: any) => {
  if (currentRecordId.value === record.id) {
    currentRecordId.value = ''
  } else {
    currentRecordId.value = record.id
  }
}

const retrySubmit = () => {
  showResult.value = false
  submitCode()
}

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const container = document.querySelector('.coding-main') as HTMLElement
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const newWidth = ((e.clientX - rect.left) / rect.width) * 100
  
  leftPanelWidth.value = Math.min(Math.max(newWidth, 20), 60)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const loadSubmissionHistory = async () => {
  try {
    const res = await request.get('/submissions/my')
    if (res.code === 200 && res.data) {
      const qId = questionId.value
      submitHistory.value = (res.data || [])
        .filter((s: any) => s.question_id === qId)
        .map((s: any) => ({
          id: s.submission_id || '',
          time: s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '',
          status: (s.passed_count || 0) >= (s.total_count || 1) ? 'passed' : 'failed',
          score: s.overall_score ?? 0,
          language: s.language || '',
          code: s.code || '',
          runtime: 0
        }))
    }
  } catch (e) { console.error('加载提交历史失败:', e) }
}

onMounted(() => {
  loadQuestion()
  loadSubmissionHistory()

  const savedDraft = localStorage.getItem(`draft_${questionId.value}_${selectedLanguage.value}`)
  if (savedDraft) {
    code.value = savedDraft
  } else {
    code.value = codeTemplates[selectedLanguage.value] || ''
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.coding-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.coding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.problem-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-select {
  width: 140px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-icon {
  font-size: 16px;
}

.coding-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.problem-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
  transition: width 0.2s;
}

.panel-tabs {
  padding: 12px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.problem-description {
  line-height: 1.8;
}

.description-header {
  margin-bottom: 20px;
}

.description-header h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.section p {
  margin: 0;
  padding-left: 16px;
}

.examples {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
}

.example-block {
  margin-bottom: 16px;
}

.example-block:last-child {
  margin-bottom: 0;
}

.example-item {
  margin-bottom: 8px;
}

.example-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.example-code {
  margin: 0;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.constraints ul {
  margin: 0;
  padding-left: 32px;
}

.constraints li {
  margin-bottom: 8px;
}

.testcases-panel {
  height: 100%;
}

.testcase-tabs {
  margin-bottom: 16px;
}

.testcase-content {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
}

.testcase-item {
  margin-bottom: 16px;
}

.testcase-item:last-child {
  margin-bottom: 0;
}

.testcase-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.testcase-code {
  margin: 0;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: #e8e8e8;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: #1890ff;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  transition: width 0.2s;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
}

.editor-title {
  color: #ccc;
  font-size: 14px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.line-numbers {
  padding: 16px 8px;
  background: #252526;
  border-right: 1px solid #3c3c3c;
  text-align: right;
  user-select: none;
}

.line-numbers span {
  display: block;
  font-family: monospace;
  font-size: 13px;
  color: #6b6b6b;
  line-height: 20px;
}

.code-editor {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  outline: none;
  color: #ccc;
  font-family: monospace;
  font-size: 13px;
  line-height: 20px;
  resize: none;
}

.code-editor::placeholder {
  color: #4a4a4a;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #252526;
  border-top: 1px solid #3c3c3c;
}

.code-info {
  display: flex;
  gap: 16px;
  color: #8c8c8c;
  font-size: 12px;
}

.submit-actions {
  display: flex;
  gap: 8px;
}

.history-list {
  max-height: 600px;
  overflow-y: auto;
}

.history-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-card.current {
  border: 1px solid #1890ff;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-time {
  font-size: 12px;
  color: #8c8c8c;
}

.history-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.score-label {
  font-size: 12px;
  color: #8c8c8c;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
}

.score-value.high {
  color: #52c41a;
}

.score-value.medium {
  color: #faad14;
}

.score-value.low {
  color: #f5222d;
}

.score-total {
  font-size: 14px;
  color: #8c8c8c;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.divider {
  color: #e8e8e8;
}

.result-content {
  padding: 20px;
}

.result-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 32px;
}

.result-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.result-status.passed .el-icon {
  color: #52c41a;
}

.result-status.failed .el-icon {
  color: #f5222d;
}

.result-status span {
  font-size: 20px;
  font-weight: 600;
}

.result-status.passed span {
  color: #52c41a;
}

.result-status.failed span {
  color: #f5222d;
}

.result-score {
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 4px solid;
}

.score-circle.high {
  border-color: #52c41a;
}

.score-circle.medium {
  border-color: #faad14;
}

.score-circle.low {
  border-color: #f5222d;
}

.score-num {
  font-size: 36px;
  font-weight: 600;
}

.score-circle.high .score-num,
.score-circle.high .score-unit {
  color: #52c41a;
}

.score-circle.medium .score-num,
.score-circle.medium .score-unit {
  color: #faad14;
}

.score-circle.low .score-num,
.score-circle.low .score-unit {
  color: #f5222d;
}

.score-unit {
  font-size: 14px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 32px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.result-cases {
  margin-top: 20px;
}

.result-cases h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.cases-list {
  max-height: 300px;
  overflow-y: auto;
}

.case-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid;
}

.case-item.passed {
  border-left-color: #52c41a;
}

.case-item.failed {
  border-left-color: #f5222d;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.case-name {
  font-weight: 500;
}

.case-details {
  margin-top: 12px;
}

.case-row {
  margin-bottom: 8px;
}

.case-row:last-child {
  margin-bottom: 0;
}

.case-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.case-code.expected {
  border: 1px solid #52c41a;
}

.case-code.actual {
  border: 1px solid #f5222d;
}

.history-code {
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.code-preview {
  margin: 0;
  padding: 8px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>