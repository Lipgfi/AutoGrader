import Mock from 'mockjs'
import userMock from './user.ts'
import questionsMock from './questions.ts'

export function setupMock() {
  const allMocks = [...userMock, ...questionsMock]
  
  allMocks.forEach(mock => {
    Mock.mock(RegExp(mock.url + '.*'), mock.method, mock.response)
  })
  
  console.log('[Mock] 已加载', allMocks.length, '个mock接口')
}
