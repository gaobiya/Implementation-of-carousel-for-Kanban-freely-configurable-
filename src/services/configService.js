/**
 * 配置管理服务
 * 提供配置的增删改查功能
 * 调用后端API进行数据操作
 */

import {
  getBoardConfigList,
  getBoardConfigById,
  addBoardConfig,
  updateBoardConfig,
  deleteBoardConfig,
  getBoardConfigItemList,
  addBoardConfigItem,
  updateBoardConfigItem,
  deleteBoardConfigItem
} from './api.js'

/**
 * 从API响应中提取数组数据
 * 支持多种数据格式：数组、{data: []}、{Data: []}、{result: []}
 */
function extractArray(data) {
  if (!data) {
    return []
  }
  
  if (Array.isArray(data)) {
    return data
  }
  
  // 支持 {result: []} 格式（后端分页返回格式）
  if (data.result && Array.isArray(data.result)) {
    return data.result
  }
  
  // 支持 {data: []} 格式
  if (data.data && Array.isArray(data.data)) {
    return data.data
  }
  
  // 支持 {Data: []} 格式（PascalCase）
  if (data.Data && Array.isArray(data.Data)) {
    return data.Data
  }
  
  console.warn('无法提取数组数据，数据格式:', data)
  return []
}

/**
 * 获取配置列表（包含看板列表）
 * @param {object} params - 查询参数
 * @returns {Promise<array>} 配置列表
 */
export async function getConfigs(params = {}) {
  try {
    // 获取配置列表
    const result = await getBoardConfigList({
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 5,
      ...params
    })

    // 检查返回格式，支持分页对象和数组
    let configs, total, pageNum, pageSize
    
    // API返回格式：{ data: [], total: 10, pageNum: 1, pageSize: 10 }
    if (result && typeof result === 'object') {
      if ('data' in result && Array.isArray(result.data)) {
        // 标准分页格式
        configs = result.data
        total = result.total || 0
        pageNum = result.pageNum || params.pageNum || 1
        pageSize = result.pageSize || params.pageSize || 10
      } else if (Array.isArray(result)) {
        // 直接数组格式（兼容旧代码）
        configs = result
        total = result.length
        pageNum = params.pageNum || 1
        pageSize = params.pageSize || 10
      } else {
        // 尝试从result中提取数组
        configs = extractArray(result)
        total = result.total || result.totalNum || 0
        pageNum = result.pageNum || result.pageIndex || params.pageNum || 1
        pageSize = result.pageSize || params.pageSize || 10
      }
    } else {
      configs = []
      total = 0
      pageNum = params.pageNum || 1
      pageSize = params.pageSize || 10
    }
    
    // 为每个配置获取看板列表
    const configsWithBoards = await Promise.all(
      configs.map(async (config) => {
        try {
          const itemsResult = await getBoardConfigItemList({
            configId: config.id,
            pageSize: 1000, // 获取所有看板
            status: true // 只获取启用的看板
          })
          
          const items = extractArray(itemsResult)
          
          // 转换为前端格式，按sortOrder排序
          const boards = items
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(item => ({
              id: item.boardId,
              name: item.boardName,
              path: item.boardPath,
              itemId: item.id, // 保存配置项ID，用于更新和删除
              sortOrder: item.sortOrder || 0
            }))
          
          return {
            ...config,
            boards
          }
        } catch (error) {
          console.error(`获取配置 ${config.id} 的看板列表失败:`, error)
          return {
            ...config,
            boards: []
          }
        }
      })
    )
    
    // 返回分页格式
    return {
      data: configsWithBoards,
      total: total,
      pageNum: pageNum,
      pageSize: pageSize
    }
  } catch (error) {
    console.error('获取配置列表失败:', error)
    throw error
  }
}

/**
 * 根据ConfigCode获取配置（包含看板列表）
 * @param {string} configCode - 配置编码（业务编码）
 * @returns {Promise<object>} 配置对象
 */
export async function getConfigById(configCode) {
  try {
    // 使用列表接口按ConfigCode查询
    const { getBoardConfigList } = await import('./api.js')
    const result = await getBoardConfigList({
      configCode: String(configCode),
      pageSize: 1
    })
    // 从返回结果中提取配置列表
    const configs = extractArray(result)
    if (configs.length === 0) {
      throw new Error(`未找到ConfigCode为 "${configCode}" 的配置`)
    }
    const config = configs[0]
    
    // 获取看板列表（使用数字ID）
    const itemsResult = await getBoardConfigItemList({
      configId: config.id, // 使用数字ID（主键）
      pageSize: 1000,
      status: true
    })
    
    const items = extractArray(itemsResult)
    const boards = items
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(item => ({
        id: item.boardId,
        name: item.boardName,
        path: item.boardPath,
        itemId: item.id,
        sortOrder: item.sortOrder || 0
      }))
    
    return {
      ...config,
      boards
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    throw error
  }
}

/**
 * 添加新配置
 * @param {object} config - 配置信息
 * @returns {Promise<object>} 新配置
 */
export async function addConfig(config) {
  try {
    // 准备配置数据（不需要传id，后端自动生成）
    const configData = {
      configCode: config.configCode || config.id, // 使用configCode作为业务标识
      name: config.name || '未命名配置',
      switchInterval: config.switchInterval || 5000,
      isDefault: config.isDefault || false,
      status: config.status !== undefined ? config.status : true,
      remark: config.remark || ''
    }
    
    // 创建配置（返回新创建的配置ID）
    await addBoardConfig(configData)
    
    // 获取刚创建的配置（通过configCode查找）
    const newConfig = await getConfigById(configData.configCode)
    
    // 如果有看板列表，创建看板配置项（使用数字ID）
    if (config.boards && config.boards.length > 0) {
      await Promise.all(
        config.boards.map((board, index) =>
          addBoardConfigItem({
            configId: newConfig.id, // 使用数字ID（主键）
            boardId: board.id,
            boardName: board.name,
            boardPath: board.path,
            sortOrder: index + 1,
            status: true
          })
        )
      )
    }
    
    // 返回完整配置
    return await getConfigById(newConfig.configCode)
  } catch (error) {
    console.error('添加配置失败:', error)
    throw error
  }
}

/**
 * 更新配置
 * @param {string} configCode - 配置编码
 * @param {object} updates - 更新数据
 * @returns {Promise<object>} 更新后的配置
 */
export async function updateConfig(configCode, updates) {
  try {
    // 先获取当前配置，获取数字ID
    const currentConfig = await getConfigById(configCode)
    const numericId = currentConfig.id // 数字ID（主键）
    
    // 分离看板列表和配置基本信息
    const { boards, ...configUpdates } = updates
    
    // 如果更新了看板列表，需要同步更新配置项
    if (boards !== undefined) {
      // 先获取现有的配置项
      const itemsResult = await getBoardConfigItemList({
        configId: numericId, // 使用数字ID
        pageSize: 1000
      })
      const existingItems = extractArray(itemsResult)
      
      // 删除所有现有配置项
      if (existingItems.length > 0) {
        const itemIds = existingItems.map(item => item.id)
        await deleteBoardConfigItem(itemIds)
      }
      
      // 创建新的配置项
      if (boards && boards.length > 0) {
        await Promise.all(
          boards.map((board, index) => {
            return addBoardConfigItem({
              configId: numericId, // 使用数字ID（主键）
              boardId: board.id,
              boardName: board.name,
              boardPath: board.path,
              sortOrder: index + 1,
              status: true
            })
          })
        )
      }
    }
    
    // 更新配置基本信息（排除boards字段）
    const { id, ...configDataWithoutId } = configUpdates
    if (Object.keys(configDataWithoutId).length > 0) {
      const configData = {
        id: numericId,  // 使用数字ID（主键）
        ...configDataWithoutId
      }
      await updateBoardConfig(configData)
    }
    
    // 返回更新后的完整配置
    return await getConfigById(currentConfig.configCode)
  } catch (error) {
    console.error('更新配置失败:', error)
    throw error
  }
}

/**
 * 删除配置
 * @param {string} configCode - 配置编码
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteConfig(configCode) {
  try {
    // 先获取配置，获取数字ID
    const config = await getConfigById(configCode)
    const numericId = config.id // 数字ID（主键）
    
    // 先删除所有配置项
    const itemsResult = await getBoardConfigItemList({
      configId: numericId, // 使用数字ID
      pageSize: 1000
    })
    const items = extractArray(itemsResult)
    
    if (items.length > 0) {
      const itemIds = items.map(item => item.id)
      await deleteBoardConfigItem(itemIds)
    }
    
    // 删除配置（使用数字ID）
    await deleteBoardConfig(numericId)
    return true
  } catch (error) {
    console.error('删除配置失败:', error)
    throw error
  }
}

/**
 * 在配置中添加看板
 * @param {string} configCode - 配置编码
 * @param {object} board - 看板信息
 * @returns {Promise<object>} 新看板
 */
export async function addBoardToConfig(configCode, board) {
  try {
    // 先获取配置，获取数字ID
    const config = await getConfigById(configCode)
    const numericId = config.id // 数字ID（主键）
    
    // 创建配置项
    // boardId如果为空，使用boardName作为boardId
    const boardId = board.id || board.name || `board_${Date.now()}`
    
    // 如果提供了sortOrder，使用提供的值；否则自动计算
    let sortOrder = board.sortOrder
    if (!sortOrder || sortOrder <= 0) {
      const itemsResult = await getBoardConfigItemList({
        configId: numericId, // 使用数字ID
        pageSize: 1000
      })
      const items = extractArray(itemsResult)
      const maxSortOrder = items.length > 0 
        ? Math.max(...items.map(item => item.sortOrder || 0))
        : 0
      sortOrder = maxSortOrder + 1
    }
    
    await addBoardConfigItem({
      configId: numericId, // 使用数字ID（主键）
      boardId: boardId,
      boardName: board.name,
      boardPath: board.path,
      sortOrder: sortOrder,
      status: true
    })
    
    // 不返回配置，由调用方重新获取配置列表
    return true
  } catch (error) {
    console.error('添加看板失败:', error)
    throw error
  }
}

/**
 * 更新配置中的看板
 * @param {string} configCode - 配置编码
 * @param {string} boardId - 看板ID
 * @param {object} updates - 更新数据
 * @returns {Promise<boolean>} 是否成功
 */
export async function updateBoardInConfig(configCode, boardId, updates) {
  try {
    // 先获取配置，获取数字ID
    const config = await getConfigById(configCode)
    const numericId = config.id // 数字ID（主键）
    
    // 获取配置项
    const itemsResult = await getBoardConfigItemList({
      configId: numericId, // 使用数字ID
      boardId: boardId,
      pageSize: 1
    })
    const items = extractArray(itemsResult)
    
    if (items.length === 0) {
      throw new Error(`看板ID "${boardId}" 不存在`)
    }
    
    const item = items[0]
    
    // 更新配置项
    await updateBoardConfigItem({
      id: item.id,
      boardId: updates.id !== undefined ? updates.id : boardId,
      boardName: updates.name,
      boardPath: updates.path,
      sortOrder: updates.sortOrder !== undefined && updates.sortOrder !== null ? updates.sortOrder : item.sortOrder
    })
    
    // 不返回配置，由调用方重新获取配置列表
    return true
  } catch (error) {
    console.error('更新看板失败:', error)
    throw error
  }
}

/**
 * 删除配置中的看板
 * @param {string} configCode - 配置编码
 * @param {string} boardId - 看板ID
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteBoardFromConfig(configCode, boardId) {
  try {
    // 先获取配置，获取数字ID
    const config = await getConfigById(configCode)
    const numericId = config.id // 数字ID（主键）
    
    // 获取配置项
    const itemsResult = await getBoardConfigItemList({
      configId: numericId, // 使用数字ID
      boardId: boardId,
      pageSize: 1
    })
    const items = extractArray(itemsResult)
    
    if (items.length === 0) {
      throw new Error(`看板ID "${boardId}" 不存在`)
    }
    
    // 删除配置项
    await deleteBoardConfigItem(items[0].id)
    return true
  } catch (error) {
    console.error('删除看板失败:', error)
    throw error
  }
}

/**
 * 调整看板顺序
 * @param {string} configCode - 配置编码
 * @param {number} fromIndex - 原索引
 * @param {number} toIndex - 目标索引
 * @returns {Promise<array>} 更新后的看板列表
 */
export async function reorderBoards(configCode, fromIndex, toIndex) {
  try {
    // 获取当前配置的看板列表
    const config = await getConfigById(configCode)
    const boards = config.boards || []
    
    if (fromIndex < 0 || fromIndex >= boards.length || 
        toIndex < 0 || toIndex >= boards.length) {
      throw new Error('索引超出范围')
    }
    
    // 调整数组顺序
    const newBoards = [...boards]
    const [moved] = newBoards.splice(fromIndex, 1)
    newBoards.splice(toIndex, 0, moved)
    
    // 更新所有看板的sortOrder
    await Promise.all(
      newBoards.map((board, index) => {
        if (board.itemId) {
          return updateBoardConfigItem({
            id: board.itemId,
            sortOrder: index + 1
          })
        }
      })
    )
    
    // 返回更新后的配置
    const updatedConfig = await getConfigById(config.configCode)
    return updatedConfig.boards
  } catch (error) {
    console.error('调整看板顺序失败:', error)
    throw error
  }
}
