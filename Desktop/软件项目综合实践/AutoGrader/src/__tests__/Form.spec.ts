import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormComponent from '../components/Form/index.vue'

describe('FormComponent', () => {
  const mockFormItems = [
    {
      prop: 'name',
      label: '姓名',
      type: 'input',
      placeholder: '请输入姓名'
    },
    {
      prop: 'age',
      label: '年龄',
      type: 'number',
      min: 1,
      max: 100
    },
    {
      prop: 'gender',
      label: '性别',
      type: 'select',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    },
    {
      prop: 'agree',
      label: '同意协议',
      type: 'checkbox'
    }
  ]

  it('should render form with form items', () => {
    const wrapper = mount(FormComponent, {
      props: {
        model: { name: '', age: '', gender: '', agree: false },
        items: mockFormItems
      }
    })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.findAll('.el-form-item')).toHaveLength(mockFormItems.length)
  })

  it('should render different types of form items', () => {
    const wrapper = mount(FormComponent, {
      props: {
        model: { name: '', age: '', gender: '', agree: false },
        items: mockFormItems
      }
    })

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('should update model when form items change', async () => {
    const wrapper = mount(FormComponent, {
      props: {
        model: { name: '', age: '', gender: '', agree: false },
        items: mockFormItems
      }
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('测试姓名')
    await input.trigger('blur')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should emit submit event when form is submitted', async () => {
    const wrapper = mount(FormComponent, {
      props: {
        model: { name: '测试', age: '20', gender: 'male', agree: true },
        items: mockFormItems
      }
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('should validate form when submit', async () => {
    const wrapper = mount(FormComponent, {
      props: {
        model: { name: '', age: '', gender: '', agree: false },
        items: mockFormItems.map(item => ({
          ...item,
          required: true
        }))
      }
    })

    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.findAll('.el-form-item__error')).toHaveLength(mockFormItems.length)
  })
})
