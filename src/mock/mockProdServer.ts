import { createProdMockServer } from 'vite-plugin-mock/client'
import userMock from './user'
import courseMock from './course'
import assignmentMock from './assignment'
import gradeMock from './grade'
import studentMock from './student'

export function setupProdMockServer() {
  createProdMockServer([
    ...userMock,
    ...courseMock,
    ...assignmentMock,
    ...gradeMock,
    ...studentMock
  ])
}
