// @ts-ignore
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'
import userMock from './user'
import courseMock from './course'
import assignmentMock from './assignment'
import gradeMock from './grade'
import studentMock from './student'

// @ts-ignore
if (import.meta.env && import.meta.env.PROD) {
  createProdMockServer([
    ...userMock,
    ...courseMock,
    ...assignmentMock,
    ...gradeMock,
    ...studentMock
  ])
}
