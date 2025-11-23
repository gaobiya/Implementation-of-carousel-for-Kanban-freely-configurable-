<template>
  <div class="app">
    <div class="header">
      <h1>看板轮播配置管理</h1>
      <el-button type="primary" icon="el-icon-plus" @click="showAddConfig" :loading="loading">
        添加配置
      </el-button>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="true"
      @close="errorMessage = ''"
      style="margin: 20px;"
    />

    <div class="config-list">
      <div
        v-for="config in configs"
        :key="config.id"
        class="config-card"
        :class="{ active: editingConfigId === (config.configCode || config.id) }"
      >
        <div class="config-header">
          <div class="config-info">
            <h3>{{ config.name }}</h3>
            <p class="config-meta">
              ID: <code>{{ config.id }}</code> | 
              编码: <code>{{ config.configCode || '未设置' }}</code> | 
              切换间隔: <strong>{{ config.switchInterval / 1000 }}秒</strong> | 
              看板数量: <strong>{{ config.boards.length }}</strong>
            </p>
          </div>
          <div class="config-actions">
            <el-button size="small" icon="el-icon-view" @click="previewConfig(config)" title="预览">
              预览
            </el-button>
            <el-button size="small" type="primary" icon="el-icon-edit" @click="editConfig(config)" title="编辑">
              编辑
            </el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteConfigHandler(config)" title="删除">
              删除
            </el-button>
          </div>
        </div>

        <!-- 编辑模式 -->
        <div v-if="editingConfigId === (config.configCode || config.id)" class="config-edit">
          <el-form :model="editingConfig" label-width="120px" size="small">
            <el-form-item label="配置名称">
              <el-input
                v-model="editingConfig.name"
                placeholder="请输入配置名称"
              />
            </el-form-item>
            <el-form-item label="配置编码" required>
              <el-input
                v-model="editingConfig.configCode"
                placeholder="请输入配置编码（用于URL参数，如：config1）"
              />
              <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                配置编码用于URL参数，如：/board1.html?configCode=config1
              </div>
            </el-form-item>
            <el-form-item label="配置ID">
              <el-input
                :value="editingConfig.id"
                disabled
                placeholder="系统自动生成"
              />
            </el-form-item>
            <el-form-item label="切换间隔（毫秒）">
              <el-input-number
                v-model="editingConfig.switchInterval"
                :min="1000"
                :step="1000"
                placeholder="5000"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <!-- 看板列表管理 -->
          <div class="boards-section">
            <div class="section-header">
              <h4>看板列表</h4>
              <el-button size="small" type="primary" icon="el-icon-plus" @click="showAddBoard">
                添加看板
              </el-button>
            </div>
            <div class="boards-list">
              <div
                v-for="(board, index) in editingConfig.boards"
                :key="board.id"
                class="board-item"
              >
                <div class="board-info">
                  <span class="board-index">{{ board.sortOrder || (index + 1) }}</span>
                  <div class="board-details">
                    <strong>{{ board.name }}</strong>
                    <code>{{ board.path }}</code>
                  </div>
                </div>
                <div class="board-actions">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    @click="editBoard(config.id, board)"
                    title="编辑"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="deleteBoardFromConfigHandler(config.id, board.id)"
                    title="删除"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              <el-empty v-if="editingConfig.boards.length === 0 && !loading" description="暂无看板，请添加看板" :image-size="80"></el-empty>
            </div>
            
            <!-- 看板列表分页 -->
            <el-pagination
              v-if="boardTotal > 0"
              @size-change="handleBoardSizeChange"
              @current-change="handleBoardCurrentChange"
              :current-page="boardPageNum"
              :page-sizes="[5, 10, 20, 50]"
              :page-size="boardPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="boardTotal"
              style="margin-top: 15px; text-align: right;"
              small
            />
          </div>

          <div class="form-actions">
            <el-button type="primary" @click="saveConfig" :loading="loading">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
    </div>
      </div>

      <el-empty v-if="configs.length === 0 && !loading" description="暂无配置，请添加配置"></el-empty>
      
      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5, 10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
      />
    </div>

    <!-- 添加/编辑配置对话框 -->
    <el-dialog
      :title="editingConfigId ? '编辑配置' : '添加配置'"
      :visible.sync="showAddConfigDialog"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="newConfig" label-width="120px" size="small">
        <el-form-item label="配置名称" required>
          <el-input
            v-model="newConfig.name"
            placeholder="例如：配置1 - 生产看板轮播"
          />
        </el-form-item>
        <el-form-item label="配置编码" required>
          <el-input
            v-model="newConfig.configCode"
            placeholder="例如：config1（用于URL参数?configCode=config1）"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            配置编码用于URL参数，如：/board1.html?configCode=config1
          </div>
        </el-form-item>
        <el-form-item label="切换间隔（毫秒）" required>
          <el-input-number
            v-model="newConfig.switchInterval"
            :min="1000"
            :step="1000"
            placeholder="5000"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNewConfig" :loading="loading">保存</el-button>
      </div>
    </el-dialog>

    <!-- 添加/编辑看板对话框 -->
    <el-dialog
      :title="editingBoardId ? '编辑看板' : '添加看板'"
      :visible.sync="showAddBoardDialog"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="newBoard" label-width="100px" size="small">
        <el-form-item label="看板名称" required>
          <el-input
            v-model="newBoard.name"
            placeholder="例如：看板1 - 生产看板"
          />
        </el-form-item>
        <el-form-item label="访问路径" required>
          <el-input
            v-model="newBoard.path"
            placeholder="内部页面：/board1.html 或 外部网站：http://example.com"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            内部页面使用相对路径，外部网站使用完整URL
          </div>
        </el-form-item>
        <el-form-item label="排序号" required>
          <el-input-number
            v-model="newBoard.sortOrder"
            :min="1"
            placeholder="例如：1"
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            排序号用于控制看板在轮播中的显示顺序，数字越小越靠前，不能重复
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showAddBoardDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNewBoard" :loading="loading">保存</el-button>
      </div>
    </el-dialog>
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
  deleteBoardFromConfig
} from './services/configService.js'

export default {
  name: 'App',
  data() {
    return {
      configs: [],
      loading: false,
      errorMessage: '',
      editingConfigId: null,
      editingConfig: null,
      editingBoardId: null,
      currentConfigId: null,
      showAddConfigDialog: false,
      showAddBoardDialog: false,
      // 配置列表分页相关
      pageNum: 1,
      pageSize: 5,
      total: 0,
      // 看板列表分页相关
      boardPageNum: 1,
      boardPageSize: 5,
      boardTotal: 0,
      newConfig: {
        configCode: '',
        name: '',
        switchInterval: 5000
      },
      newBoard: {
        name: '',
        path: '',
        sortOrder: null
      }
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    async loadConfigs() {
      this.loading = true
      this.errorMessage = ''
      try {
        const result = await getConfigs({
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        // 如果返回的是分页对象，提取数据和总数
        if (result && typeof result === 'object' && 'data' in result) {
          this.configs = result.data || []
          this.total = result.total || 0
        } else if (Array.isArray(result)) {
          // 如果直接返回数组，说明是旧格式
          this.configs = result
          this.total = result.length
        } else {
          this.configs = []
          this.total = 0
        }
      } catch (error) {
        this.errorMessage = '加载配置失败：' + (error.message || '未知错误')
        console.error('加载配置失败:', error)
        this.configs = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.pageNum = 1
      this.loadConfigs()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.loadConfigs()
    },
    handleBoardSizeChange(val) {
      this.boardPageSize = val
      this.boardPageNum = 1
      this.loadBoardsForConfig()
    },
    handleBoardCurrentChange(val) {
      this.boardPageNum = val
      this.loadBoardsForConfig()
    },
    /**
     * 检查配置编码是否重复
     * @param {string} configCode - 要检查的配置编码
     * @param {string|number} excludeConfigId - 排除的配置ID（编辑时排除自己）
     * @returns {Promise<boolean>} true表示重复，false表示不重复
     */
    async checkConfigCodeDuplicate(configCode, excludeConfigId = null) {
      if (!configCode) {
        return false
      }
      
      try {
        // 通过API查询配置编码是否存在
        const { getBoardConfigList } = await import('./services/api.js')
        const result = await getBoardConfigList({
          configCode: configCode,
          pageSize: 100 // 获取足够多的数据来检查
        })
        
        // 提取配置列表
        let configs = []
        if (result && typeof result === 'object') {
          if ('data' in result && Array.isArray(result.data)) {
            configs = result.data
          } else if (Array.isArray(result)) {
            configs = result
          } else {
            const { extractArray } = await import('./services/configService.js')
            configs = extractArray(result)
          }
        }
        
        // 检查是否有重复的配置编码（排除当前编辑的配置）
        const duplicate = configs.find(config => {
          // 排除当前编辑的配置
          if (excludeConfigId) {
            const configKey = config.configCode || config.id
            const excludeKey = excludeConfigId
            // 如果都是数字，转换为数字比较；否则字符串比较
            if (typeof configKey === 'number' && typeof excludeKey === 'number') {
              if (configKey === excludeKey) {
                return false // 排除自己
              }
            } else if (String(configKey) === String(excludeKey)) {
              return false // 排除自己
            }
          }
          
          // 检查configCode是否相同（忽略大小写）
          const existingCode = config.configCode || ''
          return existingCode && String(existingCode).toLowerCase() === String(configCode).toLowerCase()
        })
        
        return !!duplicate
      } catch (error) {
        console.error('检查配置编码重复失败:', error)
        // 如果API调用失败，回退到前端检查（仅检查当前页的配置）
        const duplicate = this.configs.find(config => {
          // 排除当前编辑的配置
          if (excludeConfigId) {
            const configKey = config.configCode || config.id
            const excludeKey = excludeConfigId
            if (typeof configKey === 'number' && typeof excludeKey === 'number') {
              if (configKey === excludeKey) {
                return false
              }
            } else if (String(configKey) === String(excludeKey)) {
              return false
            }
          }
          
          const existingCode = config.configCode || ''
          return existingCode && String(existingCode).toLowerCase() === String(configCode).toLowerCase()
        })
        return !!duplicate
      }
    },
    editConfig(config) {
      // 使用configCode作为业务标识，如果没有则使用id
      this.editingConfigId = config.configCode || config.id
      // 先复制配置基本信息，看板列表稍后通过API加载
      this.editingConfig = {
        ...config,
        boards: [] // 先清空，等待API加载
      }
      // 重置看板列表分页
      this.boardPageNum = 1
      this.boardPageSize = 5
      this.boardTotal = 0
      // 加载看板列表（带分页）
      this.loadBoardsForConfig()
    },
    async loadBoardsForConfig() {
      if (!this.editingConfigId || !this.editingConfig) {
        return
      }
      
      this.loading = true
      try {
        // 获取配置ID（数字ID）
        const config = this.configs.find(c => (c.configCode || c.id) === this.editingConfigId)
        if (!config || !config.id) {
          return
        }
        
        // 调用API获取看板列表（带分页）
        const { getBoardConfigItemList } = await import('./services/api.js')
        const result = await getBoardConfigItemList({
          configId: config.id,
          pageNum: this.boardPageNum,
          pageSize: this.boardPageSize,
          status: true // 只获取启用的看板
        })
        
        // 解析返回数据
        let boards = []
        let total = 0
        
        if (result && typeof result === 'object') {
          if ('data' in result && Array.isArray(result.data)) {
            boards = result.data
            total = result.total || 0
          } else if (Array.isArray(result)) {
            boards = result
            total = result.length
          } else {
            // 尝试提取数组
            const { extractArray } = await import('./services/configService.js')
            boards = extractArray(result)
            total = result.total || result.totalNum || boards.length
          }
        }
        
        // 转换为前端格式，按sortOrder排序
        const boardsFormatted = boards
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(item => ({
            id: item.boardId,
            name: item.boardName,
            path: item.boardPath,
            itemId: item.id, // 保存配置项ID，用于更新和删除
            sortOrder: item.sortOrder || 0
          }))
        
        // 更新编辑配置的看板列表
        this.editingConfig.boards = boardsFormatted
        this.boardTotal = total
      } catch (error) {
        console.error('加载看板列表失败:', error)
        this.$message.error('加载看板列表失败：' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    cancelEdit() {
      this.editingConfigId = null
      this.editingConfig = null
      // 重置看板列表分页
      this.boardPageNum = 1
      this.boardPageSize = 5
      this.boardTotal = 0
      this.loadConfigs()
    },
    async saveConfig() {
      // 校验配置编码是否重复
      if (this.editingConfig.configCode) {
        const isDuplicate = await this.checkConfigCodeDuplicate(this.editingConfig.configCode, this.editingConfigId)
        if (isDuplicate) {
          this.$message.warning('配置编码已存在，请使用其他编码')
          return
        }
      }
      
      this.loading = true
      this.errorMessage = ''
      try {
        // 使用configCode作为业务标识
        const updates = { ...this.editingConfig }
        // 移除id字段，因为id是主键，不应该被修改
        delete updates.id
        
        await updateConfig(this.editingConfigId, updates)
        this.$message.success('配置保存成功')
        this.cancelEdit()
      } catch (error) {
        this.errorMessage = '保存失败：' + (error.message || '未知错误')
        this.$message.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    },
    async deleteConfigHandler(config) {
      try {
        await this.$confirm('确定要删除这个配置吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.loading = true
        this.errorMessage = ''
        try {
          // 使用数字ID删除配置
          await deleteConfig(config.id)
          // 如果当前页没有数据了，回到上一页
          if (this.configs.length === 1 && this.pageNum > 1) {
            this.pageNum--
          }
          await this.loadConfigs()
          this.$message.success('删除成功')
        } catch (error) {
          this.errorMessage = '删除失败：' + (error.message || '未知错误')
          this.$message.error(this.errorMessage)
        } finally {
          this.loading = false
        }
      } catch (error) {
        // 用户取消删除
        if (error !== 'cancel') {
          this.$message.error('删除操作失败')
        }
      }
    },
    previewConfig(config) {
      // 打开第一个看板页面，使用当前配置
      const firstBoard = config.boards[0]
      if (firstBoard) {
        const isExternal = /^https?:\/\//i.test(firstBoard.path.trim())
        // 使用configCode作为URL参数，如果没有则使用id
        const configCode = config.configCode || config.id
        let url
        if (isExternal) {
          url = `/board-external.html?url=${encodeURIComponent(firstBoard.path)}&boardId=${encodeURIComponent(firstBoard.id)}&configCode=${configCode}`
        } else {
          url = `${firstBoard.path}?configCode=${configCode}`
        }
        window.open(url, '_blank')
      } else {
        this.$message.warning('该配置没有看板，无法预览')
      }
    },
    showAddConfig() {
      this.newConfig = {
        configCode: '',
        name: '',
        switchInterval: 5000
      }
      this.editingConfigId = null
      this.showAddConfigDialog = true
    },
    async saveNewConfig() {
      if (!this.newConfig.configCode || !this.newConfig.name) {
        this.$message.warning('请填写配置编码和名称')
        return
      }
      
      // 校验配置编码是否重复
      const isDuplicate = await this.checkConfigCodeDuplicate(this.newConfig.configCode, this.editingConfigId)
      if (isDuplicate) {
        this.$message.warning('配置编码已存在，请使用其他编码')
        return
      }
      
      this.loading = true
      this.errorMessage = ''
      try {
        if (this.editingConfigId) {
          await updateConfig(this.editingConfigId, this.newConfig)
        } else {
          await addConfig(this.newConfig)
        }
        this.showAddConfigDialog = false
        // 如果是新增，重置到第一页；如果是编辑，保持当前页
        if (!this.editingConfigId) {
          this.pageNum = 1
        }
        await this.loadConfigs()
        this.$message.success('保存成功')
      } catch (error) {
        this.errorMessage = '保存失败：' + (error.message || '未知错误')
        this.$message.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    },
    showAddBoard() {
      this.editingBoardId = null
      // 使用configCode或id
      this.currentConfigId = this.editingConfigId
      // 计算默认排序号（当前看板数量+1）
      const currentConfig = this.configs.find(c => (c.configCode || c.id) === this.editingConfigId)
      const defaultSortOrder = currentConfig && currentConfig.boards && currentConfig.boards.length > 0
        ? Math.max(...currentConfig.boards.map(b => b.sortOrder || 0)) + 1
        : 1
      this.newBoard = { name: '', path: '', sortOrder: defaultSortOrder }
      this.showAddBoardDialog = true
    },
    editBoard(configId, board) {
      this.editingBoardId = board.id
      this.newBoard = JSON.parse(JSON.stringify(board))
      // 找到配置，使用configCode或id
      const config = this.configs.find(c => c.id === configId || c.configCode === configId)
      this.currentConfigId = config ? (config.configCode || config.id) : configId
      this.showAddBoardDialog = true
    },
    async saveNewBoard() {
      // 校验必填项
      if (!this.newBoard.name || !this.newBoard.path || !this.newBoard.sortOrder) {
        this.$message.warning('请填写看板名称、访问路径和排序号')
        return
      }
      
      // 校验排序号必须是正整数
      const sortOrder = parseInt(this.newBoard.sortOrder, 10)
      if (isNaN(sortOrder) || sortOrder < 1) {
        this.$message.warning('排序号必须是大于0的整数')
        return
      }
      
      // 确定要使用的配置ID
      const configId = this.currentConfigId || this.editingConfigId
      if (!configId) {
        this.$message.warning('请先选择或编辑一个配置')
        return
      }
      
      // 校验排序号是否重复
      const currentConfig = this.configs.find(c => (c.configCode || c.id) === configId)
      if (currentConfig && currentConfig.boards) {
        // 检查是否有其他看板使用了相同的排序号
        const duplicateBoard = currentConfig.boards.find(board => {
          // 如果是编辑模式，排除当前编辑的看板
          if (this.editingBoardId && board.id === this.editingBoardId) {
            return false
          }
          return board.sortOrder === sortOrder
        })
        
        if (duplicateBoard) {
          this.$message.warning(`排序号 ${sortOrder} 已被看板"${duplicateBoard.name}"使用，请使用其他排序号`)
          return
        }
      }
      
      this.loading = true
      this.errorMessage = ''
      try {
        if (this.editingBoardId) {
          // 更新看板
          await updateBoardInConfig(configId, this.editingBoardId, this.newBoard)
        } else {
          // 添加看板
          await addBoardToConfig(configId, this.newBoard)
        }
        this.showAddBoardDialog = false
        this.editingBoardId = null
        this.currentConfigId = null
        this.newBoard = { name: '', path: '', sortOrder: null }
        
        // 如果是新增看板，重置到第一页；如果是编辑，保持当前页
        if (!this.editingBoardId) {
          this.boardPageNum = 1
        }
        
        // 重新加载看板列表（带分页）
        await this.loadBoardsForConfig()
        this.$message.success('保存成功')
      } catch (error) {
        this.errorMessage = '保存失败：' + (error.message || '未知错误')
        this.$message.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    },
    async deleteBoardFromConfigHandler(configId, boardId) {
      try {
        await this.$confirm('确定要删除这个看板吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.loading = true
        this.errorMessage = ''
        try {
          // 先找到配置，获取configCode或id
          const config = this.configs.find(c => c.id === configId || c.configCode === configId)
          const configKey = config ? (config.configCode || config.id) : configId
          
          await deleteBoardFromConfig(configKey, boardId)
          
          // 如果删除后当前页没有数据了，回到上一页
          const currentBoardCount = this.editingConfig.boards.length
          if (currentBoardCount === 1 && this.boardPageNum > 1) {
            this.boardPageNum--
          }
          
          // 重新加载看板列表（带分页）
          await this.loadBoardsForConfig()
          this.$message.success('删除成功')
        } catch (error) {
          this.errorMessage = '删除失败：' + (error.message || '未知错误')
          this.$message.error(this.errorMessage)
        } finally {
          this.loading = false
        }
      } catch (error) {
        // 用户取消删除
        if (error !== 'cancel') {
          this.$message.error('删除操作失败')
        }
      }
    },
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


.config-edit {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
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


.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

</style>
