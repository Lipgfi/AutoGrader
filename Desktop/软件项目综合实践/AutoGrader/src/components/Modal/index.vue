<template>
  <el-dialog
    v-bind="$attrs"
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    @close="() => emit('close')"
  >
    <template v-if="$slots.header">
      <template #header>
        <slot name="header"></slot>
      </template>
    </template>
    
    <slot></slot>
    
    <template v-if="$slots.footer">
      <template #footer>
        <slot name="footer"></slot>
      </template>
    </template>
    <template v-else-if="showDefaultFooter">
      <template #footer>
        <el-button @click="() => {
          emit('cancel')
          visible.value = false
        }">{{ cancelText }}</el-button>
        <el-button type="primary" @click="() => emit('confirm')">{{ confirmText }}</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  width?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showDefaultFooter?: boolean
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'confirm': []
  'cancel': []
}>()

const visible = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped>

</style>
