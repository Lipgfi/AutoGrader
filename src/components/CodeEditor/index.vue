<template>
  <div class="code-editor">
    <div class="editor-header">
      <div class="language-selector">
        <el-select v-model="selectedLanguage" @change="handleLanguageChange" size="small">
          <el-option
            v-for="lang in languages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>
      </div>
      <div class="editor-actions">
        <el-button size="small" @click="formatCode">
          <el-icon><Refresh /></el-icon>
          格式化
        </el-button>
        <el-button size="small" @click="clearCode">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </div>
    <div class="editor-body">
      <div class="line-numbers" ref="lineNumbersRef">
        <div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
      </div>
      <div class="code-area">
        <textarea
          v-model="code"
          class="code-textarea"
          :placeholder="placeholder"
          @input="handleInput"
          @scroll="handleScroll"
          ref="textareaRef"
        ></textarea>
        <pre class="code-highlight" ref="highlightRef"></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

interface Props {
  modelValue: string
  language?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  placeholder: '请输入代码...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'language-change': [language: string]
}>()

const code = ref(props.modelValue)
const selectedLanguage = ref(props.language)
const highlightRef = ref<HTMLElement>()
const lineNumbersRef = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const lineCount = computed(() => {
  const lines = code.value.split('\n')
  return Math.max(lines.length, 10)
})

const languages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
  { label: 'Go', value: 'go' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'PHP', value: 'php' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' }
]

watch(() => props.modelValue, (newVal) => {
  code.value = newVal
  updateHighlight()
})

watch(() => props.language, (newVal) => {
  selectedLanguage.value = newVal
  updateHighlight()
})

onMounted(() => {
  updateHighlight()
})

const handleInput = () => {
  emit('update:modelValue', code.value)
  updateHighlight()
}

const handleLanguageChange = (lang: string) => {
  selectedLanguage.value = lang
  emit('language-change', lang)
  updateHighlight()
}

const handleScroll = () => {
  if (textareaRef.value && highlightRef.value && lineNumbersRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

const updateHighlight = () => {
  if (highlightRef.value) {
    const escapedCode = code.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    let highlighted = hljs.highlight(escapedCode, { language: selectedLanguage.value, ignoreIllegals: true }).value
    highlightRef.value.innerHTML = highlighted
    
    nextTick(() => {
      handleScroll()
    })
  }
}

const formatCode = () => {
  try {
    if (selectedLanguage.value === 'javascript' || selectedLanguage.value === 'typescript' || selectedLanguage.value === 'json') {
      code.value = JSON.stringify(JSON.parse(code.value), null, 2)
    } else if (selectedLanguage.value === 'html' || selectedLanguage.value === 'css') {
      code.value = code.value.replace(/</g, '\n<').replace(/>/g, '>\n').replace(/\s+/g, ' ')
    }
    emit('update:modelValue', code.value)
    updateHighlight()
    ElMessage.success('代码格式化成功')
  } catch (error) {
    ElMessage.error('代码格式化失败，请检查代码语法')
  }
}

const clearCode = () => {
  code.value = ''
  emit('update:modelValue', '')
  updateHighlight()
}
</script>

<style scoped>
.code-editor {
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.language-selector {
  flex: 1;
}

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.editor-body {
  position: relative;
  flex: 1;
  min-height: 300px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
}

.line-numbers {
  width: 50px;
  padding: var(--spacing-md) 0;
  background-color: var(--bg-tertiary);
  border-right: 1px solid var(--border-light);
  overflow: hidden;
  user-select: none;
}

.line-number {
  height: 21px;
  line-height: 21px;
  padding: 0 var(--spacing-sm);
  font-family: var(--font-family-code);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: right;
  white-space: nowrap;
}

.code-area {
  flex: 1;
  position: relative;
  overflow: auto;
}

.code-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  border: none;
  outline: none;
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: transparent;
  background: transparent;
  resize: none;
  z-index: 1;
  white-space: pre;
  overflow-wrap: normal;
  overflow-x: auto;
}

.code-highlight {
  position: relative;
  padding: var(--spacing-md);
  margin: 0;
  font-family: var(--font-family-code);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
  z-index: 0;
  background-color: var(--bg-primary);
}

.code-textarea, .code-highlight {
  tab-size: 2;
}

.editor-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.editor-body::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.editor-body::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 4px;
}

.editor-body::-webkit-scrollbar-thumb:hover {
  background: var(--border-medium);
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .language-selector {
    width: 100%;
  }
  
  .editor-actions {
    justify-content: center;
  }
  
  .editor-body {
    min-height: 200px;
  }
  
  .line-numbers {
    width: 40px;
  }
  
  .line-number {
    font-size: 10px;
    height: 19px;
    line-height: 19px;
  }
}

@media (max-width: 480px) {
  .line-numbers {
    width: 35px;
  }
}
</style>
