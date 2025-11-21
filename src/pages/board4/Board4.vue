<template>
  <div class="board4">
    <h1>看板4 - 仓储看板</h1>
    <p>这是第四个看板页面，您可以在这里添加仓储相关的数据展示</p>
  </div>
</template>

<script>
import { getNextBoard, getSwitchInterval } from '../../utils/boardSwitch.js'

export default {
  name: 'Board4',
  data() {
    return {
      timer: null, // 定时器引用
      currentBoardId: 'board4' // 当前看板的ID，用于从配置中查找下一个看板
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
    startAutoSwitch() {
      // 清除可能存在的旧定时器
      this.clearAutoSwitch()
      
      // 从URL中获取配置ID（如果有的话）
      const urlParams = new URLSearchParams(window.location.search)
      const configId = urlParams.get('id')
      
      // 从配置中获取下一个要跳转的看板
      const nextBoard = getNextBoard(this.currentBoardId, configId)
      
      if (!nextBoard) {
        console.error('无法获取下一个看板配置，自动切换功能已禁用')
        return
      }

      // 从配置中获取切换间隔时间
      const switchInterval = getSwitchInterval(configId)
      
      // 设置定时器，在指定时间后执行跳转
      this.timer = setTimeout(() => {
        // 构建跳转路径，保持URL中的id参数
        let nextPath = nextBoard.path
        if (configId) {
          // 如果URL中有id参数，在跳转时也带上这个参数
          const separator = nextPath.includes('?') ? '&' : '?'
          nextPath = `${nextPath}${separator}id=${configId}`
        }
        
        // 使用 window.location.href 实现页面跳转
        // 跳转路径从配置文件中读取，并保持配置ID参数
        window.location.href = nextPath
      }, switchInterval)
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
.board4 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

