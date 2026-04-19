// 如果 vitest 模块未安装，请执行: npm install --save-dev vitest
// 如果已安装但仍然报错，请检查 tsconfig.json 中的 types 配置或添加以下声明:
// declare module 'vitest'
import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
// @ts-ignore
// 如果 @vue/test-utils 模块未安装，请执行: npm install --save-dev @vue/test-utils
// 如果已安装但仍然报错，请检查 tsconfig.json 中的 types 配置或添加以下声明:
// declare module '@vue/test-utils'
import TableComponent from '../components/Table/index.vue'

describe('TableComponent', () => {
  const mockData = [
    { id: 1, name: '张三', age: 20, status: 'active' },
    { id: 2, name: '李四', age: 22, status: 'inactive' },
    { id: 3, name: '王五', age: 21, status: 'active' }
  ]

  const mockColumns = [
    { prop: 'id', label: 'ID', width: '80px' },
    { prop: 'name', label: '姓名', minWidth: '120px' },
    { prop: 'age', label: '年龄', width: '80px' },
    { 
      prop: 'status', 
      label: '状态', 
      width: '100px',
      formatter: (row: any) => row.status === 'active' ? '激活' : '禁用'
    },
    { 
      label: '操作', 
      width: '150px',
      slot: 'operation'
    }
  ]

  it('should render table with data and columns', () => {
    const wrapper = mount(TableComponent, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(mockData.length)
  })

  it('should emit row-click event when row is clicked', async () => {
    const wrapper = mount(TableComponent, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    })

    // 触发点击事件
    const row = wrapper.find('tbody tr')
    expect(row.exists()).toBe(true)
    
    // 触发点击事件
    await row.trigger('click')
    
    // 验证事件是否被触发
    const rowClickEvent = wrapper.emitted('row-click')
    expect(rowClickEvent).toBeTruthy()
    if (rowClickEvent) {
      expect(rowClickEvent.length).toBe(1)
      expect(rowClickEvent[0][0]).toEqual(mockData[0])
    }
  })

  it('should render custom formatter correctly', () => {
    const wrapper = mount(TableComponent, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    })

    const statusCells = wrapper.findAll('tbody tr td:nth-child(4)')
    expect(statusCells[0].text()).toBe('激活')
    expect(statusCells[1].text()).toBe('禁用')
  })

  it('should render custom slot correctly', () => {
    const wrapper = mount(TableComponent, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      slots: {
        operation: (scope: any) => `<button data-id="${scope.row.id}">编辑</button>`
      }
    })

    const operationCells = wrapper.findAll('tbody tr td:nth-child(5)')
    expect(operationCells[0].find('button').exists()).toBe(true)
    expect(operationCells[0].find('button').attributes('data-id')).toBe('1')
  })

  it('should handle empty data', () => {
    const wrapper = mount(TableComponent, {
      props: {
        data: [],
        columns: mockColumns
      }
    })

    expect(wrapper.find('.el-table__empty-text').exists()).toBe(true)
  })
})
