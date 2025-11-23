/**
 * API服务
 * 封装所有后端接口调用
 */

const API_BASE_URL = 'http://localhost:8888'

/**
 * 通用请求方法
 */
async function request(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    }
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    const data = await response.json()

    if (data.code === 200) {
      return data.data
    } else {
      throw new Error(data.msg || '请求失败')
    }
  } catch (error) {
    console.error('API请求失败:', error)
    throw error
  }
}

/**
 * 将前端camelCase转换为后端PascalCase
 */
function toPascalCase(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const mapping = {
    id: 'Id',
    configCode: 'ConfigCode',
    name: 'Name',
    switchInterval: 'SwitchInterval',
    isDefault: 'IsDefault',
    status: 'Status',
    remark: 'Remark',
    createTime: 'CreateTime',
    updateTime: 'UpdateTime',
    reserve1: 'Reserve1',
    reserve2: 'Reserve2',
    reserve3: 'Reserve3',
    configId: 'ConfigId',
    boardId: 'BoardId',
    boardName: 'BoardName',
    boardPath: 'BoardPath',
    sortOrder: 'SortOrder',
    pageNum: 'pageNum',
    pageSize: 'pageSize'
  }

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const pascalKey = mapping[key] || key
    result[pascalKey] = value
  }
  return result
}

/**
 * 将后端PascalCase转换为前端camelCase
 */
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const mapping = {
    Id: 'id',
    ConfigCode: 'configCode',
    Name: 'name',
    SwitchInterval: 'switchInterval',
    IsDefault: 'isDefault',
    Status: 'status',
    Remark: 'remark',
    CreateTime: 'createTime',
    UpdateTime: 'updateTime',
    Reserve1: 'reserve1',
    Reserve2: 'reserve2',
    Reserve3: 'reserve3',
    ConfigId: 'configId',
    BoardId: 'boardId',
    BoardName: 'boardName',
    BoardPath: 'boardPath',
    SortOrder: 'sortOrder',
    Total: 'total',
    PageNum: 'pageNum',
    PageSize: 'pageSize',
    Data: 'data'
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item))
  }

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = mapping[key] || key
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = toCamelCase(value)
    } else {
      result[camelKey] = value
    }
  }
  return result
}

// ==================== 看板配置 (BoardConfig) API ====================

/**
 * 查询看板配置列表
 * @param {object} params - 查询参数
 * @returns {Promise<object>} 分页数据
 */
export async function getBoardConfigList(params = {}) {
  const queryParams = new URLSearchParams()
  
  if (params.pageNum) queryParams.append('pageNum', params.pageNum)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.configCode) queryParams.append('ConfigCode', params.configCode)
  if (params.name) queryParams.append('Name', params.name)
  if (params.status !== undefined) queryParams.append('Status', params.status)
  if (params.isDefault !== undefined) queryParams.append('IsDefault', params.isDefault)

  const url = `/report/BoardConfig/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  const data = await request(url)
  
  // 转换数据格式，支持多种返回格式
  // 格式1: {result: [], totalNum: 3, pageIndex: 1, pageSize: 1000}
  if (data && data.result && Array.isArray(data.result)) {
    return {
      total: data.totalNum || data.total || 0,
      pageNum: data.pageIndex || data.pageNum || 1,
      pageSize: data.pageSize || 10,
      data: toCamelCase(data.result)
    }
  }
  
  // 格式2: {Data: [], Total: 3, PageNum: 1, PageSize: 10}
  if (data && data.Data && Array.isArray(data.Data)) {
    return {
      total: data.Total || data.total || 0,
      pageNum: data.PageNum || data.pageNum || 1,
      pageSize: data.PageSize || data.pageSize || 10,
      data: toCamelCase(data.Data)
    }
  }
  
  // 格式3: {data: [], total: 3, pageNum: 1, pageSize: 10}
  if (data && data.data && Array.isArray(data.data)) {
    return {
      total: data.total || 0,
      pageNum: data.pageNum || 1,
      pageSize: data.pageSize || 10,
      data: toCamelCase(data.data)
    }
  }
  
  // 直接是数组
  if (Array.isArray(data)) {
    return {
      total: data.length,
      pageNum: 1,
      pageSize: data.length,
      data: toCamelCase(data)
    }
  }
  
  return toCamelCase(data)
}

/**
 * 查询看板配置详情
 * @param {number|string} id - 配置ID（数字主键）
 * @returns {Promise<object>} 配置详情
 */
export async function getBoardConfigById(id) {
  // 确保ID是数字
  const numericId = typeof id === 'number' ? id : parseInt(id, 10)
  if (isNaN(numericId)) {
    throw new Error(`配置ID必须是数字: ${id}`)
  }
  const data = await request(`/report/BoardConfig/${numericId}`)
  return toCamelCase(data)
}

/**
 * 添加看板配置
 * @param {object} config - 配置信息
 * @returns {Promise<number>} 影响行数
 */
export async function addBoardConfig(config) {
  const body = toPascalCase(config)
  return await request('/report/BoardConfig', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * 更新看板配置
 * @param {object} config - 配置信息
 * @returns {Promise<number>} 影响行数
 */
export async function updateBoardConfig(config) {
  const body = toPascalCase(config)
  return await request('/report/BoardConfig', {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

/**
 * 删除看板配置
 * @param {number|string|array} ids - 配置ID（数字主键），支持单个或数组
 * @returns {Promise<number>} 删除数量
 */
export async function deleteBoardConfig(ids) {
  // 确保所有ID都是数字
  const normalizeId = (id) => {
    const num = typeof id === 'number' ? id : parseInt(id, 10)
    if (isNaN(num)) {
      throw new Error(`配置ID必须是数字: ${id}`)
    }
    return num
  }
  
  const idArray = Array.isArray(ids) ? ids.map(normalizeId) : [normalizeId(ids)]
  const idStr = idArray.join(',')
  return await request(`/report/BoardConfig/${idStr}`, {
    method: 'DELETE'
  })
}

// ==================== 看板配置项 (BoardConfigItem) API ====================

/**
 * 查询看板配置项列表
 * @param {object} params - 查询参数
 * @returns {Promise<object>} 分页数据
 */
export async function getBoardConfigItemList(params = {}) {
  const queryParams = new URLSearchParams()
  
  if (params.pageNum) queryParams.append('pageNum', params.pageNum)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  if (params.configId !== undefined) {
    // ConfigId是数字类型
    const configId = typeof params.configId === 'number' ? params.configId : parseInt(params.configId, 10)
    if (!isNaN(configId)) {
      queryParams.append('ConfigId', configId)
    }
  }
  if (params.boardId) queryParams.append('BoardId', params.boardId)
  if (params.boardName) queryParams.append('BoardName', params.boardName)
  if (params.status !== undefined) queryParams.append('Status', params.status)

  const url = `/report/BoardConfigItem/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  const data = await request(url)
  
  // 转换数据格式，支持多种返回格式
  // 格式1: {result: [], totalNum: 3, pageIndex: 1, pageSize: 1000}
  if (data && data.result && Array.isArray(data.result)) {
    return {
      total: data.totalNum || data.total || 0,
      pageNum: data.pageIndex || data.pageNum || 1,
      pageSize: data.pageSize || 10,
      data: toCamelCase(data.result)
    }
  }
  
  // 格式2: {Data: [], Total: 3, PageNum: 1, PageSize: 10}
  if (data && data.Data && Array.isArray(data.Data)) {
    return {
      total: data.Total || data.total || 0,
      pageNum: data.PageNum || data.pageNum || 1,
      pageSize: data.PageSize || data.pageSize || 10,
      data: toCamelCase(data.Data)
    }
  }
  
  // 格式3: {data: [], total: 3, pageNum: 1, pageSize: 10}
  if (data && data.data && Array.isArray(data.data)) {
    return {
      total: data.total || 0,
      pageNum: data.pageNum || 1,
      pageSize: data.pageSize || 10,
      data: toCamelCase(data.data)
    }
  }
  
  // 直接是数组
  if (Array.isArray(data)) {
    return {
      total: data.length,
      pageNum: 1,
      pageSize: data.length,
      data: toCamelCase(data)
    }
  }
  
  return toCamelCase(data)
}

/**
 * 查询看板配置项详情
 * @param {number} id - 配置项ID
 * @returns {Promise<object>} 配置项详情
 */
export async function getBoardConfigItemById(id) {
  const data = await request(`/report/BoardConfigItem/${id}`)
  return toCamelCase(data)
}

/**
 * 添加看板配置项
 * @param {object} item - 配置项信息
 * @returns {Promise<number>} 影响行数
 */
export async function addBoardConfigItem(item) {
  const body = toPascalCase(item)
  // 确保ConfigId是数字
  if (body.ConfigId !== undefined) {
    body.ConfigId = typeof body.ConfigId === 'number' ? body.ConfigId : parseInt(body.ConfigId, 10)
    if (isNaN(body.ConfigId)) {
      throw new Error(`ConfigId必须是数字: ${item.configId}`)
    }
  }
  return await request('/report/BoardConfigItem', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * 更新看板配置项
 * @param {object} item - 配置项信息（必须包含id）
 * @returns {Promise<number>} 影响行数
 */
export async function updateBoardConfigItem(item) {
  const body = toPascalCase(item)
  // 确保ConfigId是数字
  if (body.ConfigId !== undefined) {
    body.ConfigId = typeof body.ConfigId === 'number' ? body.ConfigId : parseInt(body.ConfigId, 10)
    if (isNaN(body.ConfigId)) {
      throw new Error(`ConfigId必须是数字: ${item.configId}`)
    }
  }
  return await request('/report/BoardConfigItem', {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

/**
 * 删除看板配置项
 * @param {number|array} ids - 配置项ID，支持单个或数组
 * @returns {Promise<number>} 删除数量
 */
export async function deleteBoardConfigItem(ids) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids.toString()
  return await request(`/report/BoardConfigItem/${idStr}`, {
    method: 'DELETE'
  })
}

