/**
 * 看板切换工具函数
 * 
 * 提供看板自动切换相关的工具方法
 */

import boardSwitchConfig from '../config/boardSwitch.js'

/**
 * 根据当前看板ID获取下一个要切换的看板
 * @param {string} currentBoardId - 当前看板的ID
 * @returns {object|null} 下一个看板对象，如果找不到则返回null
 */
export function getNextBoard(currentBoardId) {
  const { boards } = boardSwitchConfig
  
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
 * @returns {number} 切换间隔时间
 */
export function getSwitchInterval() {
  return boardSwitchConfig.switchInterval || 5000
}

/**
 * 获取所有看板配置
 * @returns {array} 看板配置列表
 */
export function getAllBoards() {
  return boardSwitchConfig.boards || []
}

