/**
 * 配置管理服务
 * 提供配置的增删改查功能
 * 目前使用 localStorage 存储，后续可以改为调用后端API
 */

import { getAllConfigs } from '../config/boardSwitch.js'

const STORAGE_KEY = 'board_configs'

/**
 * 从localStorage获取配置列表
 * 如果localStorage中没有，则从配置文件读取并初始化
 */
export function getConfigs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('读取配置失败:', error)
  }
  
  // 如果localStorage中没有，从配置文件读取并初始化
  const defaultConfigs = getAllConfigs()
  saveConfigs(defaultConfigs)
  return defaultConfigs
}

/**
 * 保存配置列表到localStorage
 */
export function saveConfigs(configs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    return false
  }
}

/**
 * 根据ID获取配置
 */
export function getConfigById(configId) {
  const configs = getConfigs()
  return configs.find(c => c.id === configId) || null
}

/**
 * 添加新配置
 */
export function addConfig(config) {
  const configs = getConfigs()
  
  // 检查ID是否已存在
  if (configs.find(c => c.id === config.id)) {
    throw new Error(`配置ID "${config.id}" 已存在`)
  }
  
  // 确保有必要的字段
  const newConfig = {
    id: config.id || `config_${Date.now()}`,
    name: config.name || '未命名配置',
    switchInterval: config.switchInterval || 5000,
    boards: config.boards || []
  }
  
  configs.push(newConfig)
  saveConfigs(configs)
  return newConfig
}

/**
 * 更新配置
 */
export function updateConfig(configId, updates) {
  const configs = getConfigs()
  const index = configs.findIndex(c => c.id === configId)
  
  if (index === -1) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  // 更新配置
  configs[index] = {
    ...configs[index],
    ...updates
  }
  
  saveConfigs(configs)
  return configs[index]
}

/**
 * 删除配置
 */
export function deleteConfig(configId) {
  const configs = getConfigs()
  const index = configs.findIndex(c => c.id === configId)
  
  if (index === -1) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  configs.splice(index, 1)
  saveConfigs(configs)
  return true
}

/**
 * 在配置中添加看板
 */
export function addBoardToConfig(configId, board) {
  const config = getConfigById(configId)
  if (!config) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  // 检查看板ID是否已存在
  if (config.boards.find(b => b.id === board.id)) {
    throw new Error(`看板ID "${board.id}" 已存在`)
  }
  
  const newBoard = {
    id: board.id || `board_${Date.now()}`,
    name: board.name || '未命名看板',
    path: board.path || ''
  }
  
  config.boards.push(newBoard)
  updateConfig(configId, { boards: config.boards })
  return newBoard
}

/**
 * 更新配置中的看板
 */
export function updateBoardInConfig(configId, boardId, updates) {
  const config = getConfigById(configId)
  if (!config) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  const boardIndex = config.boards.findIndex(b => b.id === boardId)
  if (boardIndex === -1) {
    throw new Error(`看板ID "${boardId}" 不存在`)
  }
  
  config.boards[boardIndex] = {
    ...config.boards[boardIndex],
    ...updates
  }
  
  updateConfig(configId, { boards: config.boards })
  return config.boards[boardIndex]
}

/**
 * 删除配置中的看板
 */
export function deleteBoardFromConfig(configId, boardId) {
  const config = getConfigById(configId)
  if (!config) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  const boardIndex = config.boards.findIndex(b => b.id === boardId)
  if (boardIndex === -1) {
    throw new Error(`看板ID "${boardId}" 不存在`)
  }
  
  config.boards.splice(boardIndex, 1)
  updateConfig(configId, { boards: config.boards })
  return true
}

/**
 * 调整看板顺序
 */
export function reorderBoards(configId, fromIndex, toIndex) {
  const config = getConfigById(configId)
  if (!config) {
    throw new Error(`配置ID "${configId}" 不存在`)
  }
  
  const boards = [...config.boards]
  const [moved] = boards.splice(fromIndex, 1)
  boards.splice(toIndex, 0, moved)
  
  updateConfig(configId, { boards })
  return boards
}


