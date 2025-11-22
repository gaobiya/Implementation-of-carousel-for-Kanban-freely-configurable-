/**
 * 看板自动切换配置文件
 * 
 * 此文件用于管理看板的自动切换行为，支持多个配置项目。
 * 每个配置项目可以通过URL参数中的id来选择使用。
 * 
 * 使用方式：
 * - /board1.html?id=config1 使用 config1 的配置
 * - /board1.html?id=config2 使用 config2 的配置
 * - 如果不提供id参数，默认使用第一个配置
 * 
 * 修改此文件后，需要重新构建项目才能生效
 */

/**
 * 配置项目集合
 * 每个配置项目包含：
 * - id: 配置唯一标识（用于URL参数选择）
 * - switchInterval: 切换间隔时间（单位：毫秒）
 * - boards: 参与轮播的看板列表
 */
const configs = [
  {
    // 配置1：默认配置
    id: 'config1',
    name: '配置1 - 生产看板轮播',
    /**
     * 切换间隔时间（单位：毫秒）
     * 例如：5000 表示 5 秒切换一次
     */
    switchInterval: 5000,
    /**
     * 参与轮播的看板列表
     * 按照数组顺序循环切换
     * 
     * 每个看板对象包含：
     * - id: 看板唯一标识（用于识别当前页面）
     * - name: 看板显示名称
     * - path: 看板页面的访问路径
     *   * 内部页面：使用相对路径，如 '/board1.html'
     *   * 外部网站：使用完整URL，如 'http://example.com' 或 'https://example.com'
     *   * 外部URL会自动通过中间页面（board-external.html）加载，实现自动跳转功能
     */
    boards: [
      {
        id: 'board1',
        name: '看板1 - 生产看板',
        path: '/board1.html'
      },
      {
        id: 'board2',
        name: '看板2 - 设备看板',
        path: '/board2.html'
      },
      {
        id: 'board3',
        name: '看板3 - 质量看板',
        path: '/board3.html'
      },
      {
        id: 'board4',
        name: '看板4 - 仓储看板',
        path: '/board4.html'
      },
      {
        id: 'board5',
        name: '看板5 - 能耗看板',
        path: '/board5.html'
      },
      // 可以添加外部网站，例如：
      {
        id: 'external1',
        name: '外部看板1',
        path: 'http://baidu.com'
      },
      // {
      //   id: 'external2',
      //   name: '外部看板2',
      //   path: 'https://example.com/kanban'
      // }
      // 注意：外部网站会通过 board-external.html 中间页面加载，确保自动跳转功能正常工作
    ]
  },
  {
    // 配置2：快速切换配置
    id: 'config2',
    name: '配置2 - 快速切换',
    switchInterval: 3000, // 3秒切换一次
    boards: [
      {
        id: 'board1',
        name: '看板1 - 生产看板',
        path: '/board1.html'
      },
      {
        id: 'board2',
        name: '看板2 - 设备看板',
        path: '/board2.html'
      },
      {
        id: 'board3',
        name: '看板3 - 质量看板',
        path: '/board3.html'
      },
      {
        id: 'board4',
        name: '看板4 - 仓储看板',
        path: '/board4.html'
      }
    ]
  }
  // 可以继续添加更多配置项目
  // {
  //   id: 'config3',
  //   name: '配置3 - 自定义配置',
  //   switchInterval: 10000,
  //   boards: [
  //     {
  //       id: 'board1',
  //       name: '看板1 - 生产看板',
  //       path: '/board1.html'
  //     },
  //     {
  //       id: 'board2',
  //       name: '看板2 - 设备看板',
  //       path: '/board2.html'
  //     },
  //     {
  //       id: 'board3',
  //       name: '看板3 - 质量看板',
  //       path: '/board3.html'
  //     }
  //   ]
  // }
]

/**
 * 根据配置ID获取对应的配置
 * @param {string} configId - 配置ID（从URL参数中获取）
 * @returns {object} 配置对象，如果找不到则返回第一个配置
 */
export function getConfigById(configId) {
  if (!configId) {
    // 如果没有提供configId，返回第一个配置（默认配置）
    return configs[0] || null
  }
  
  const config = configs.find(c => c.id === configId)
  if (!config) {
    console.warn(`未找到ID为 "${configId}" 的配置，使用默认配置`)
    return configs[0] || null
  }
  
  return config
}

/**
 * 获取所有配置列表
 * @returns {array} 所有配置项目
 */
export function getAllConfigs() {
  return configs
}

/**
 * 获取默认配置（向后兼容）
 * @returns {object} 默认配置对象
 */
export default configs[0] || null

