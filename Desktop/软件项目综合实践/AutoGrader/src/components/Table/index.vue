<template>
  <el-table
    v-bind="$attrs"
    :data="data"
    :loading="loading"
    style="width: 100%"
    @row-click="handleRowClick"
  >
    <template v-for="column in columns" :key="column.prop || column.label">
      <el-table-column
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :align="column.align"
        :fixed="column.fixed"
        :sortable="column.sortable"
        :filters="column.filters"
        :filter-method="column.filterMethod"
      >
        <template #default="scope">
          <!-- 自定义插槽渲染 -->
          <template v-if="column.slot">
            <slot :name="column.slot" :row="scope.row" :index="scope.$index"></slot>
          </template>
          <!-- 格式化函数渲染 -->
          <template v-else-if="column.formatter">
            {{ column.formatter(scope.row, scope.column, scope.row[column.prop as string], scope.$index) }}
          </template>
          <!-- 日期类型渲染 -->
          <template v-else-if="column.type === 'date'">
            {{ formatDate(scope.row[column.prop as string], column.format || 'YYYY-MM-DD') }}
          </template>
          <!-- 标签类型渲染 -->
          <template v-else-if="column.type === 'tag'">
            <el-tag 
              :type="getColumnTagType(scope.row, column)" 
              :effect="column.tagEffect || 'plain'"
              :size="column.tagSize || 'small'"
            >
              {{ getColumnTagValue(scope.row, column) }}
            </el-tag>
          </template>
          <!-- 默认渲染 -->
          <template v-else>
            {{ scope.row[column.prop as string] }}
          </template>
        </template>
      </el-table-column>
    </template>
    <template v-if="$slots.default">
      <slot></slot>
    </template>
  </el-table>
  
  <div v-if="pagination" class="pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

interface TableColumn {
  prop?: string
  label: string
  width?: string | number
  align?: string
  fixed?: string
  type?: 'text' | 'date' | 'tag' | 'operation'
  formatter?: (row: any, column: any, value: any, index: number) => any
  slot?: string
  sortable?: boolean | string
  filters?: Array<{ text: string; value: string }>
  filterMethod?: (value: string, row: any) => boolean
  format?: string
  tagType?: string | ((row: any) => string)
  tagValue?: string | ((row: any) => string)
  tagEffect?: 'plain' | 'dark' | 'light'
  tagSize?: 'large' | 'medium' | 'small'
}

const props = defineProps<{
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  pagination?: boolean
  total?: number
  pageSize?: number
  currentPage?: number
  pageSizes?: number[]
}>()

const emit = defineEmits<{
  'size-change': [size: number]
  'current-change': [current: number]
  'row-click': [row: any, column: any, event: Event]
}>()

const currentPage = computed({
  get: () => props.currentPage || 1,
  set: (value) => emit('current-change', value)
})

const pageSize = computed({
  get: () => props.pageSize || 10,
  set: (value) => emit('size-change', value)
})

const pageSizes = computed(() => props.pageSizes || [10, 20, 50, 100])

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (current: number) => {
  emit('current-change', current)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const formatDate = (value: any, format: string): string => {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

const getColumnTagType = (row: any, column: TableColumn): string => {
  if (typeof column.tagType === 'function') {
    return column.tagType(row)
  }
  return column.tagType || 'info'
}

const getColumnTagValue = (row: any, column: TableColumn): string => {
  if (typeof column.tagValue === 'function') {
    return column.tagValue(row)
  }
  return row[column.prop as string] || ''
}
</script>

<style scoped>
.pagination {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
}
</style>
