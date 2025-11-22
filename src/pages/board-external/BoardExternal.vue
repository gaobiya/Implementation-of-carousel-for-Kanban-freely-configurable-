<template>
  <div class="board-external">
    <!-- 使用iframe加载外部网站 -->
    <iframe
      ref="externalFrame"
      :src="externalUrl"
      frameborder="0"
      class="external-iframe"
      @load="onIframeLoad"
    ></iframe>
  </div>
</template>

<script>
import { getNextBoard, getSwitchInterval, buildJumpUrl } from '../../utils/boardSwitch.js'

export default {
  name: 'BoardExternal',
  data() {
    return {
      timer: null, // 定时器引用
      externalUrl: '', // 外部网站URL
      currentBoardId: 'board-external', // 当前看板的ID（固定值，用于识别这是外部看板页面）
      configId: null // 配置ID
    }
  },
  mounted() {
    // 从URL参数中获取外部网站地址和配置信息
    const urlParams = new URLSearchParams(window.location.search)
    const url = urlParams.get('url') // 外部网站URL
    const boardId = urlParams.get('boardId') // 看板ID（用于在配置中查找下一个看板）
    this.configId = urlParams.get('id') // 配置ID
    
    if (!url) {
      console.error('未提供外部网站URL')
      return
    }
    
    // 保存外部URL和看板ID
    this.externalUrl = decodeURIComponent(url)
    if (boardId) {
      this.currentBoardId = decodeURIComponent(boardId)
    }
    
    // 开始自动切换
    this.startAutoSwitch()
  },
  beforeDestroy() {
    // 组件销毁前清除定时器，防止内存泄漏
    this.clearAutoSwitch()
  },
  methods: {
    /**
     * iframe加载完成事件
     */
    onIframeLoad() {
      console.log('外部网站加载完成:', this.externalUrl)
    },
    
    /**
     * 开始自动切换
     * 根据配置文件中的设置，自动跳转到下一个看板
     */
    startAutoSwitch() {
      // 清除可能存在的旧定时器
      this.clearAutoSwitch()
      
      // 从配置中获取下一个要跳转的看板
      const nextBoard = getNextBoard(this.currentBoardId, this.configId)
      
      if (!nextBoard) {
        console.error('无法获取下一个看板配置，自动切换功能已禁用')
        return
      }

      // 从配置中获取切换间隔时间
      const switchInterval = getSwitchInterval(this.configId)
      
      // 设置定时器，在指定时间后执行跳转
      this.timer = setTimeout(() => {
        // 构建跳转URL
        // 如果下一个看板是外部网站，跳转到 board-external.html
        // 如果是内部页面，直接跳转
        const nextPath = nextBoard.path
        const isExternal = /^https?:\/\//i.test(nextPath.trim())
        
        let jumpUrl
        if (isExternal) {
          // 外部网站：跳转到中间页面，传递URL和配置信息
          jumpUrl = `/board-external.html?url=${encodeURIComponent(nextPath)}&boardId=${encodeURIComponent(nextBoard.id)}`
          if (this.configId) {
            jumpUrl += `&id=${this.configId}`
          }
        } else {
          // 内部页面：使用 buildJumpUrl 构建URL
          jumpUrl = buildJumpUrl(nextPath, this.configId)
        }
        
        // 使用 window.location.href 实现页面跳转
        window.location.href = jumpUrl
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
.board-external {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.external-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>

