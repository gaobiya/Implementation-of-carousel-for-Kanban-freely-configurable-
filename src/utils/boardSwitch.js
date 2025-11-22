/**
 * 看板切换工具函数
 * 
 * 提供看板自动切换相关的工具方法
 * 支持根据URL参数中的配置ID来选择不同的配置
 */

import { getConfigById } from '../config/boardSwitch.js'

/**
 * 从URL中获取配置ID参数
 * @returns {string|null} 配置ID，如果URL中没有id参数则返回null
 */
export function getConfigIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('id')
}

/**
 * 根据当前看板ID和配置ID获取下一个要切换的看板
 * @param {string} currentBoardId - 当前看板的ID
 * @param {string} configId - 配置ID（可选，如果不提供则从URL参数中获取）
 * @returns {object|null} 下一个看板对象，如果找不到则返回null
 */
export function getNextBoard(currentBoardId, configId = null) {
  // 如果没有提供configId，从URL参数中获取
  if (!configId) {
    configId = getConfigIdFromUrl()
  }
  
  // 根据configId获取对应的配置
  const config = getConfigById(configId)
  
  if (!config) {
    console.error('无法获取配置，自动切换功能已禁用')
    return null
  }
  
  const { boards } = config
  
  if (!boards || boards.length === 0) {
    console.warn('看板配置列表为空')
    return null
  }

  // 查找当前看板在列表中的索引
  const currentIndex = boards.findIndex(board => board.id === currentBoardId)
  
  if (currentIndex === -1) {
    console.warn(`未找到ID为 "${currentBoardId}" 的看板配置`)
    // 如果找不到当前看板，默认返回第一个看板
    return boards[0]
  }

  // 计算下一个看板的索引（循环：最后一个的下一个是第一个）
  const nextIndex = (currentIndex + 1) % boards.length
  
  return boards[nextIndex]
}

/**
 * 获取切换间隔时间（毫秒）
 * @param {string} configId - 配置ID（可选，如果不提供则从URL参数中获取）
 * @returns {number} 切换间隔时间
 */
export function getSwitchInterval(configId = null) {
  // 如果没有提供configId，从URL参数中获取
  if (!configId) {
    configId = getConfigIdFromUrl()
  }
  
  // 根据configId获取对应的配置
  const config = getConfigById(configId)
  
  if (!config) {
    console.warn('无法获取配置，使用默认切换间隔时间')
    return 5000
  }
  
  return config.switchInterval || 5000
}

/**
 * 获取所有看板配置
 * @param {string} configId - 配置ID（可选，如果不提供则从URL参数中获取）
 * @returns {array} 看板配置列表
 */
export function getAllBoards(configId = null) {
  // 如果没有提供configId，从URL参数中获取
  if (!configId) {
    configId = getConfigIdFromUrl()
  }
  
  // 根据configId获取对应的配置
  const config = getConfigById(configId)
  
  if (!config) {
    return []
  }
  
  return config.boards || []
}

/**
 * 获取当前使用的配置ID
 * @returns {string|null} 配置ID
 */
export function getCurrentConfigId() {
  return getConfigIdFromUrl()
}

/**
 * 判断URL是否为外部链接（完整URL）
 * @param {string} url - 要判断的URL
 * @returns {boolean} 如果是外部链接返回true，否则返回false
 */
export function isExternalUrl(url) {
  if (!url) {
    return false
  }
  
  // 判断是否以 http:// 或 https:// 开头
  return /^https?:\/\//i.test(url.trim())
}

/**
 * 构建跳转URL
 * 对于内部链接，会添加配置ID参数；对于外部链接，跳转到中间页面（board-external.html）
 * @param {string} path - 跳转路径（可以是相对路径或完整URL）
 * @param {string} configId - 配置ID（可选）
 * @param {string} boardId - 看板ID（可选，用于外部网站时传递）
 * @returns {string} 构建后的跳转URL
 */
export function buildJumpUrl(path, configId = null, boardId = null) {
  if (!path) {
    return ''
  }
  
  // 如果是外部URL，跳转到中间页面 board-external.html
  if (isExternalUrl(path)) {
    let externalUrl = `/board-external.html?url=${encodeURIComponent(path)}`
    
    // 如果有看板ID，传递看板ID（用于在配置中查找下一个看板）
    if (boardId) {
      externalUrl += `&boardId=${encodeURIComponent(boardId)}`
    }
    
    // 如果有配置ID，传递配置ID（用于保持配置）
    if (configId) {
      externalUrl += `&id=${configId}`
    }
    
    return externalUrl
  }
  
  // 内部链接，如果有configId则添加参数
  if (configId) {
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}id=${configId}`
  }
  
  return path
}

