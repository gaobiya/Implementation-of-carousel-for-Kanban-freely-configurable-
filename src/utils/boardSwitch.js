/**
 * 看板切换工具函数
 * 
 * 提供看板自动切换相关的工具方法
 * 支持根据URL参数中的ConfigCode来选择不同的配置
 * 所有配置数据从后端API获取
 */

import { getConfigById } from '../services/configService.js'

/**
 * 从URL中获取配置编码参数
 * @returns {string|null} 配置编码，如果URL中没有configCode参数则返回null
 */
export function getConfigIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('configCode')
}

/**
 * 根据当前看板ID和配置编码获取下一个要切换的看板
 * @param {string} currentBoardId - 当前看板的ID
 * @param {string} configCode - 配置编码（可选，如果不提供则从URL参数中获取）
 * @returns {Promise<object|null>} 下一个看板对象，如果找不到则返回null
 */
export async function getNextBoard(currentBoardId, configCode = null) {
  // 如果没有提供configCode，从URL参数中获取
  if (!configCode) {
    configCode = getConfigIdFromUrl()
  }
  
  // 如果没有configCode，尝试获取默认配置
  if (!configCode) {
    try {
      const { getConfigs } = await import('../services/configService.js')
      const configs = await getConfigs()
      const defaultConfig = configs.find(c => c.isDefault) || configs[0]
      if (defaultConfig && defaultConfig.configCode) {
        configCode = defaultConfig.configCode
      } else if (defaultConfig) {
        console.warn('默认配置缺少configCode字段:', defaultConfig)
        return null
      }
    } catch (error) {
      console.error('获取默认配置失败:', error)
      return null
    }
  }
  
    if (!configCode) {
      console.error('无法获取配置编码，自动切换功能已禁用。请确保URL中包含configCode参数（如：?configCode=config1）或配置中有默认配置且包含configCode字段')
      return null
    }
  
  // 根据configCode获取对应的配置
  const config = await getConfigById(configCode)
  
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
  // 先尝试精确匹配
  let currentIndex = boards.findIndex(board => board.id === currentBoardId)
  
  // 如果找不到，尝试通过路径匹配（从当前页面路径判断）
  if (currentIndex === -1) {
    const currentPath = window.location.pathname
    currentIndex = boards.findIndex(board => {
      // 检查路径是否匹配（支持相对路径和绝对路径）
      const boardPath = board.path
      if (!boardPath) return false
      // 移除查询参数
      const cleanBoardPath = boardPath.split('?')[0]
      const cleanCurrentPath = currentPath
      return cleanCurrentPath.includes(cleanBoardPath) || cleanBoardPath.includes(cleanCurrentPath)
    })
  }
  
  if (currentIndex === -1) {
    console.warn(`未找到ID为 "${currentBoardId}" 的看板配置，将使用第一个看板`)
    // 如果找不到当前看板，默认返回第一个看板
    return boards[0]
  }

  // 计算下一个看板的索引（循环：最后一个的下一个是第一个）
  const nextIndex = (currentIndex + 1) % boards.length
  const nextBoard = boards[nextIndex]
  
  return nextBoard
}

/**
 * 获取切换间隔时间（毫秒）
 * @param {string} configCode - 配置编码（可选，如果不提供则从URL参数中获取）
 * @returns {Promise<number>} 切换间隔时间
 */
export async function getSwitchInterval(configCode = null) {
  // 如果没有提供configCode，从URL参数中获取
  if (!configCode) {
    configCode = getConfigIdFromUrl()
  }
  
  // 如果没有configCode，尝试获取默认配置
  if (!configCode) {
    try {
      const { getConfigs } = await import('../services/configService.js')
      const configs = await getConfigs()
      const defaultConfig = configs.find(c => c.isDefault) || configs[0]
      if (defaultConfig) {
        configCode = defaultConfig.configCode
      }
    } catch (error) {
      console.error('获取默认配置失败:', error)
      return 5000
    }
  }
  
  if (!configCode) {
    console.warn('无法获取配置编码，使用默认切换间隔时间')
    return 5000
  }
  
  // 根据configCode获取对应的配置
  const config = await getConfigById(configCode)
  
  if (!config) {
    console.warn('无法获取配置，使用默认切换间隔时间')
    return 5000
  }
  
  return config.switchInterval || 5000
}

/**
 * 获取所有看板配置
 * @param {string} configCode - 配置编码（可选，如果不提供则从URL参数中获取）
 * @returns {Promise<array>} 看板配置列表
 */
export async function getAllBoards(configCode = null) {
  // 如果没有提供configCode，从URL参数中获取
  if (!configCode) {
    configCode = getConfigIdFromUrl()
  }
  
  // 如果没有configCode，尝试获取默认配置
  if (!configCode) {
    try {
      const { getConfigs } = await import('../services/configService.js')
      const configs = await getConfigs()
      const defaultConfig = configs.find(c => c.isDefault) || configs[0]
      if (defaultConfig) {
        configCode = defaultConfig.configCode
      }
    } catch (error) {
      console.error('获取默认配置失败:', error)
      return []
    }
  }
  
  if (!configCode) {
    return []
  }
  
  // 根据configCode获取对应的配置
  const config = await getConfigById(configCode)
  
  if (!config) {
    return []
  }
  
  return config.boards || []
}

/**
 * 获取当前使用的配置编码
 * @returns {string|null} 配置编码
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
 * 对于内部链接，会添加配置编码参数；对于外部链接，跳转到中间页面（board-external.html）
 * @param {string} path - 跳转路径（可以是相对路径或完整URL）
 * @param {string} configCode - 配置编码（可选）
 * @param {string} boardId - 看板ID（可选，用于外部网站时传递）
 * @returns {string} 构建后的跳转URL
 */
export function buildJumpUrl(path, configCode = null, boardId = null) {
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
    
    // 如果有配置编码，传递配置编码（用于保持配置）
    if (configCode) {
      externalUrl += `&configCode=${configCode}`
    }
    
    return externalUrl
  }
  
  // 内部链接，如果有configCode则添加参数
  if (configCode) {
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}configCode=${configCode}`
  }
  
  return path
}

