<template>
  <div class="board2">
    <h1>看板2 - 设备看板</h1>
    <p>这是第二个看板页面，您可以在这里添加设备相关的数据展示</p>
  </div>
</template>

<script>
import { getNextBoard, getSwitchInterval, buildJumpUrl } from '../../utils/boardSwitch.js'

export default {
  name: 'Board2',
  data() {
    return {
      timer: null, // 定时器引用
      currentBoardId: 'board2' // 当前看板的ID，用于从配置中查找下一个看板
    }
  },
  mounted() {
    // 页面加载后，根据配置自动切换到下一个看板
    this.startAutoSwitch()
  },
  beforeDestroy() {
    // 组件销毁前清除定时器，防止内存泄漏
    this.clearAutoSwitch()
  },
  methods: {
    /**
     * 开始自动切换
     * 根据配置文件中的设置，自动跳转到下一个看板
     * 会保持URL中的id参数，确保使用相同的配置
     */
    async startAutoSwitch() {
      // 清除可能存在的旧定时器
      this.clearAutoSwitch()
      
      // 从URL中获取配置ID（如果有的话）
      const urlParams = new URLSearchParams(window.location.search)
      const configId = urlParams.get('configCode')
      
      try {
        // 从配置中获取下一个要跳转的看板
        const nextBoard = await getNextBoard(this.currentBoardId, configId)
        
        if (!nextBoard) {
          console.error('无法获取下一个看板配置，自动切换功能已禁用')
          return
        }

        // 从配置中获取切换间隔时间
        const switchInterval = await getSwitchInterval(configId)
      
      // 设置定时器，在指定时间后执行跳转
      this.timer = setTimeout(() => {
        // 构建跳转URL
        // 对于内部链接，会添加配置ID参数；对于外部链接，直接使用原URL
        const jumpUrl = buildJumpUrl(nextBoard.path, configId, nextBoard.id)
        
        // 使用 window.location.href 实现页面跳转
        // 支持内部页面和外部网站跳转
        window.location.href = jumpUrl
      }, switchInterval)
      } catch (error) {
        console.error('获取配置失败:', error)
      }
    },
    /**
     * 清除自动切换定时器
     */
    clearAutoSwitch() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
.board2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  opacity: 0.9;
}
</style>


