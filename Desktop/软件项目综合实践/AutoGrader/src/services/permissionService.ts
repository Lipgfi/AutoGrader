// 权限管理服务

// 权限类型
export type PermissionLevel = 'personal' | 'class' | 'grade' | 'admin'

// 用户权限接口
export interface UserPermissions {
  studentManagement: {
    view: boolean
    add: boolean
    edit: PermissionLevel
    delete: boolean
    import: boolean
    export: boolean
  }
}

// 模拟当前用户权限
export const usePermissions = () => {
  // 模拟当前用户权限
  const currentUserPermissions: UserPermissions = {
    studentManagement: {
      view: true,
      add: true,
      edit: 'grade', // 示例：年级级别的编辑权限
      delete: true,
      import: true,
      export: true
    }
  }

  // 检查是否有编辑权限
  const hasEditPermission = (level: PermissionLevel): boolean => {
    const currentLevel = currentUserPermissions.studentManagement.edit
    const permissionOrder: PermissionLevel[] = ['personal', 'class', 'grade', 'admin']
    const currentIndex = permissionOrder.indexOf(currentLevel)
    const requiredIndex = permissionOrder.indexOf(level)
    return currentIndex >= requiredIndex
  }

  // 检查是否有操作权限
  const canPerformAction = (action: keyof UserPermissions['studentManagement']): boolean => {
    return currentUserPermissions.studentManagement[action] === true
  }

  // 检查是否可以编辑特定学生
  const canEditStudent = (student: any): boolean => {
    const editLevel = currentUserPermissions.studentManagement.edit
    
    if (editLevel === 'admin') {
      return true
    }
    if (editLevel === 'grade') {
      // 假设当前用户所在年级与学生年级相同
      return true // 模拟实现
    }
    if (editLevel === 'class') {
      // 假设当前用户所在班级与学生班级相同
      return true // 模拟实现
    }
    if (editLevel === 'personal') {
      // 只能编辑自己
      return false // 模拟实现
    }
    
    return false
  }

  return {
    permissions: currentUserPermissions,
    hasEditPermission,
    canPerformAction,
    canEditStudent
  }
}
