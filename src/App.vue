<template>
  <div class="app">
    <div class="header">
      <h1>看板轮播配置管理</h1>
      <button @click="showAddConfig" class="btn-primary">
        <span>+</span> 添加配置
      </button>
    </div>

    <div class="config-list">
      <div
        v-for="config in configs"
        :key="config.id"
        class="config-card"
        :class="{ active: editingConfigId === config.id }"
      >
        <div class="config-header">
          <div class="config-info">
            <h3>{{ config.name }}</h3>
            <p class="config-meta">
              ID: <code>{{ config.id }}</code> | 
              切换间隔: <strong>{{ config.switchInterval / 1000 }}秒</strong> | 
              看板数量: <strong>{{ config.boards.length }}</strong>
            </p>
          </div>
          <div class="config-actions">
            <button @click="previewConfig(config)" class="btn-icon" title="预览">
              预览
            </button>
            <button @click="editConfig(config)" class="btn-icon" title="编辑">
              编辑
            </button>
            <button @click="deleteConfig(config.id)" class="btn-icon btn-danger" title="删除">
              删除
            </button>
          </div>
        </div>

        <!-- 编辑模式 -->
        <div v-if="editingConfigId === config.id" class="config-edit">
          <div class="form-group">
            <label>配置名称</label>
            <input
              v-model="editingConfig.name"
              type="text"
              placeholder="请输入配置名称"
            />
          </div>
          <div class="form-group">
            <label>配置ID</label>
            <input
              v-model="editingConfig.id"
              type="text"
              placeholder="请输入配置ID（用于URL参数）"
            />
          </div>
          <div class="form-group">
            <label>切换间隔（毫秒）</label>
            <input
              v-model.number="editingConfig.switchInterval"
              type="number"
              min="1000"
              step="1000"
              placeholder="5000"
            />
          </div>

          <!-- 看板列表管理 -->
          <div class="boards-section">
            <div class="section-header">
              <h4>看板列表</h4>
              <button @click="showAddBoard" class="btn-small">
                + 添加看板
              </button>
            </div>
            <div class="boards-list">
              <div
                v-for="(board, index) in editingConfig.boards"
                :key="board.id"
                class="board-item"
              >
                <div class="board-info">
                  <span class="board-index">{{ index + 1 }}</span>
                  <div class="board-details">
                    <strong>{{ board.name }}</strong>
                    <code>{{ board.path }}</code>
                  </div>
                </div>
                <div class="board-actions">
                  <button
                    @click="moveBoard(config.id, index, index - 1)"
                    :disabled="index === 0"
                    class="btn-icon-small"
                    title="上移"
                  >
                    上移
                  </button>
                  <button
                    @click="moveBoard(config.id, index, index + 1)"
                    :disabled="index === editingConfig.boards.length - 1"
                    class="btn-icon-small"
                    title="下移"
                  >
                    下移
                  </button>
                  <button
                    @click="editBoard(config.id, board)"
                    class="btn-icon-small"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteBoardFromConfig(config.id, board.id)"
                    class="btn-icon-small btn-danger"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div v-if="editingConfig.boards.length === 0" class="empty-state">
                暂无看板，请添加看板
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="saveConfig" class="btn-primary">保存</button>
            <button @click="cancelEdit" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>

      <div v-if="configs.length === 0" class="empty-state-large">
        <p>暂无配置，请添加配置</p>
      </div>
    </div>

    <!-- 添加/编辑配置对话框 -->
    <div v-if="showAddConfigDialog" class="modal-overlay" @click="showAddConfigDialog = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingConfigId ? '编辑配置' : '添加配置' }}</h2>
          <button @click="showAddConfigDialog = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>配置名称 *</label>
            <input
              v-model="newConfig.name"
              type="text"
              placeholder="例如：配置1 - 生产看板轮播"
            />
          </div>
          <div class="form-group">
            <label>配置ID *</label>
            <input
              v-model="newConfig.id"
              type="text"
              placeholder="例如：config1（用于URL参数?id=config1）"
            />
          </div>
          <div class="form-group">
            <label>切换间隔（毫秒） *</label>
            <input
              v-model.number="newConfig.switchInterval"
              type="number"
              min="1000"
              step="1000"
              placeholder="5000"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveNewConfig" class="btn-primary">保存</button>
          <button @click="showAddConfigDialog = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑看板对话框 -->
    <div v-if="showAddBoardDialog" class="modal-overlay" @click="showAddBoardDialog = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingBoardId ? '编辑看板' : '添加看板' }}</h2>
          <button @click="showAddBoardDialog = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>看板名称 *</label>
            <input
              v-model="newBoard.name"
              type="text"
              placeholder="例如：看板1 - 生产看板"
            />
          </div>
          <div class="form-group">
            <label>看板ID *</label>
            <input
              v-model="newBoard.id"
              type="text"
              placeholder="例如：board1"
            />
          </div>
          <div class="form-group">
            <label>访问路径 *</label>
            <input
              v-model="newBoard.path"
              type="text"
              placeholder="内部页面：/board1.html 或 外部网站：http://example.com"
            />
            <small>内部页面使用相对路径，外部网站使用完整URL</small>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveNewBoard" class="btn-primary">保存</button>
          <button @click="showAddBoardDialog = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getConfigs,
  addConfig,
  updateConfig,
  deleteConfig,
  addBoardToConfig,
  updateBoardInConfig,
  deleteBoardFromConfig,
  reorderBoards
} from './services/configService.js'

export default {
  name: 'App',
  data() {
    return {
      configs: [],
      editingConfigId: null,
      editingConfig: null,
      editingBoardId: null,
      currentConfigId: null,
      showAddConfigDialog: false,
      showAddBoardDialog: false,
      newConfig: {
        id: '',
        name: '',
        switchInterval: 5000,
        boards: []
      },
      newBoard: {
        id: '',
        name: '',
        path: ''
      }
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    loadConfigs() {
      this.configs = getConfigs()
    },
    editConfig(config) {
      this.editingConfigId = config.id
      this.editingConfig = JSON.parse(JSON.stringify(config))
    },
    cancelEdit() {
      this.editingConfigId = null
      this.editingConfig = null
      this.loadConfigs()
    },
    saveConfig() {
      try {
        updateConfig(this.editingConfigId, this.editingConfig)
        this.$message = '配置保存成功'
        this.cancelEdit()
        this.loadConfigs()
      } catch (error) {
        alert('保存失败：' + error.message)
      }
    },
    deleteConfig(configId) {
      if (confirm('确定要删除这个配置吗？')) {
        try {
          deleteConfig(configId)
          this.loadConfigs()
        } catch (error) {
          alert('删除失败：' + error.message)
        }
      }
    },
    previewConfig(config) {
      // 打开第一个看板页面，使用当前配置
      const firstBoard = config.boards[0]
      if (firstBoard) {
        const isExternal = /^https?:\/\//i.test(firstBoard.path.trim())
        let url
        if (isExternal) {
          url = `/board-external.html?url=${encodeURIComponent(firstBoard.path)}&boardId=${encodeURIComponent(firstBoard.id)}&id=${config.id}`
        } else {
          url = `${firstBoard.path}?id=${config.id}`
        }
        window.open(url, '_blank')
      } else {
        alert('该配置没有看板，无法预览')
      }
    },
    showAddConfig() {
      this.newConfig = {
        id: '',
        name: '',
        switchInterval: 5000,
        boards: []
      }
      this.editingConfigId = null
      this.showAddConfigDialog = true
    },
    saveNewConfig() {
      if (!this.newConfig.id || !this.newConfig.name) {
        alert('请填写配置ID和名称')
        return
      }
      try {
        if (this.editingConfigId) {
          updateConfig(this.editingConfigId, this.newConfig)
        } else {
          addConfig(this.newConfig)
        }
        this.showAddConfigDialog = false
        this.loadConfigs()
      } catch (error) {
        alert('保存失败：' + error.message)
      }
    },
    showAddBoard() {
      this.editingBoardId = null
      this.currentConfigId = this.editingConfigId
      this.newBoard = { id: '', name: '', path: '' }
      this.showAddBoardDialog = true
    },
    editBoard(configId, board) {
      this.editingBoardId = board.id
      this.newBoard = JSON.parse(JSON.stringify(board))
      this.currentConfigId = configId
      this.showAddBoardDialog = true
    },
    saveNewBoard() {
      if (!this.newBoard.id || !this.newBoard.name || !this.newBoard.path) {
        alert('请填写看板ID、名称和路径')
        return
      }
      try {
        if (this.editingBoardId && this.currentConfigId) {
          updateBoardInConfig(this.currentConfigId, this.editingBoardId, this.newBoard)
        } else if (this.editingConfigId) {
          addBoardToConfig(this.editingConfigId, this.newBoard)
        }
        this.showAddBoardDialog = false
        this.editingBoardId = null
        this.currentConfigId = null
        this.newBoard = { id: '', name: '', path: '' }
        this.loadConfigs()
        if (this.editingConfigId) {
          this.editConfig(this.configs.find(c => c.id === this.editingConfigId))
        }
      } catch (error) {
        alert('保存失败：' + error.message)
      }
    },
    deleteBoardFromConfig(configId, boardId) {
      if (confirm('确定要删除这个看板吗？')) {
        try {
          deleteBoardFromConfig(configId, boardId)
          this.loadConfigs()
          if (this.editingConfigId === configId) {
            this.editConfig(this.configs.find(c => c.id === configId))
          }
        } catch (error) {
          alert('删除失败：' + error.message)
        }
      }
    },
    moveBoard(configId, fromIndex, toIndex) {
      if (toIndex < 0 || toIndex >= this.editingConfig.boards.length) {
        return
      }
      try {
        reorderBoards(configId, fromIndex, toIndex)
        this.loadConfigs()
        this.editConfig(this.configs.find(c => c.id === configId))
      } catch (error) {
        alert('移动失败：' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 20px 30px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #ebeef5;
}

.header h1 {
  color: #303133;
  font-size: 24px;
  margin: 0;
  font-weight: 500;
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #66b1ff;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.config-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.config-card.active {
  border: 1px solid #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.config-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.config-meta {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.config-meta code {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.config-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: #f4f4f5;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  color: #909399;
}

.btn-icon:hover {
  background: #e9e9eb;
  color: #606266;
}

.btn-icon.btn-danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}

.config-edit {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.boards-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-weight: 500;
  font-size: 16px;
}

.btn-small {
  background: #409eff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-small:hover {
  background: #66b1ff;
}

.boards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.board-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f4f4f5;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.board-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.board-index {
  background: #409eff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.board-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.board-details strong {
  color: #303133;
  font-weight: 500;
}

.board-details code {
  background: #e9e9eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.board-actions {
  display: flex;
  gap: 6px;
}

.btn-icon-small {
  background: #f4f4f5;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  color: #909399;
}

.btn-icon-small:hover:not(:disabled) {
  background: #e9e9eb;
  color: #606266;
}

.btn-icon-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  background: #909399;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #a6a9ad;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

.empty-state-large {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 4px;
  color: #909399;
  border: 1px solid #ebeef5;
  font-size: 14px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: white;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h2 {
  margin: 0;
  color: #303133;
  font-weight: 500;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
  line-height: 1;
}

.btn-close:hover {
  color: #606266;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
