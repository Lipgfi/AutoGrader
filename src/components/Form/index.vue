<template>
  <el-form
    v-bind="$attrs"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    ref="formRef"
  >
    <template v-for="item in items" :key="item.prop">
      <el-form-item
        :label="item.label"
        :prop="item.prop"
        :required="item.required"
        :rules="item.rules"
      >
        <component
          :is="getComponent(item.type)"
          v-model="model[item.prop]"
          v-bind="item.props"
          :placeholder="item.placeholder"
        />
      </el-form-item>
    </template>
    <template v-if="$slots.default">
      <slot></slot>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineExpose, watch } from 'vue'

interface FormItem {
  prop: string
  label: string
  type: string
  required?: boolean
  rules?: any[]
  props?: any
  placeholder?: string
}

const props = defineProps<{
  model: Record<string, any>
  items: FormItem[]
  rules?: Record<string, any[]>
  labelWidth?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': []
}>()

const formRef = ref<any>(null)

// 监听model变化，发射update:modelValue事件
watch(
  () => props.model,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const getComponent = (type: string) => {
  const components: Record<string, string> = {
    input: 'el-input',
    select: 'el-select',
    date: 'el-date-picker',
    radio: 'el-radio-group',
    checkbox: 'el-checkbox-group',
    switch: 'el-switch',
    textarea: 'el-input'
  }
  return components[type] || 'el-input'
}

defineExpose({
  validate: (callback?: (valid: boolean) => void) => {
    return formRef.value?.validate(callback)
  },
  resetFields: () => {
    return formRef.value?.resetFields()
  }
})
</script>

<style scoped>

</style>
