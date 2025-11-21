# base_board

一个基于 Vue 2.7.14 + Vite 4.0 构建的**多页面看板模板**，包含首页和多个独立的看板页面，每个页面都可以独立开发和部署。

## 项目目标

- 提供干净、最简的 Vue 2 + Vite 多页面工程骨架，适合扩展为生产管理看板系统
- 通过 Vite 的快速热更新体验提升前端开发效率
- 构建产物兼容 IIS 等传统 Web 服务器，方便在企业内部环境部署
- 支持多个独立的看板页面，每个页面可以独立访问和开发

## 技术栈

- Vue 2.7.14（组合式 API 兼容版本，可后续引入 `@vue/composition-api`）
- Vite 4.0（开发服务器 + 构建工具）
- @vitejs/plugin-vue2（让 Vite 正确解析 Vue 2 单文件组件）

## 目录结构

```
base/
├── index.html              # 首页入口文件
├── board1.html             # 看板1入口文件
├── board2.html             # 看板2入口文件
├── src/
│   ├── main.js            # 首页的 Vue 入口文件
│   ├── App.vue            # 首页组件（导航页面）
│   ├── components/        # 公共组件目录（可放置共享组件）
│   ├── config/            # 配置文件目录
│   │   └── boardSwitch.js # 看板自动切换配置文件
│   ├── utils/             # 工具函数目录
│   │   └── boardSwitch.js # 看板切换工具函数
│   └── pages/            # 多页面目录
│       ├── board1/        # 看板1页面
│       │   ├── main.js   # 看板1的 Vue 入口文件
│       │   └── Board1.vue # 看板1组件
│       └── board2/        # 看板2页面
│           ├── main.js   # 看板2的 Vue 入口文件
│           └── Board2.vue # 看板2组件
├── public/                # 静态资源目录
│   ├── image/            # 图片资源
│   └── board/            # 看板相关静态资源
├── vite.config.js         # Vite 配置（已配置多入口）
└── web.config            # IIS URL 重写配置
```

## 页面说明

### 首页（index.html）
- 访问路径：`http://localhost:3000/` 或 `http://localhost:3000/index.html`
- 功能：作为导航页面，提供到各个看板页面的链接
- 组件：`src/App.vue`

### 看板1（board1.html）
- 访问路径：`http://localhost:3000/board1.html`
- 功能：生产看板页面，可展示生产相关数据
- 组件：`src/pages/board1/Board1.vue`
- **自动切换**：页面加载后，5秒后自动跳转到看板2

### 看板2（board2.html）
- 访问路径：`http://localhost:3000/board2.html`
- 功能：设备看板页面，可展示设备相关数据
- 组件：`src/pages/board2/Board2.vue`
- **自动切换**：页面加载后，5秒后自动跳转到看板1

### 看板自动轮播功能

看板1和看板2之间实现了自动轮播功能：
- **切换间隔**：每5秒自动切换一次
- **切换方式**：使用页面跳转（`window.location.href`）实现路由切换
- **循环方式**：看板1 → 看板2 → 看板1 → 看板2... 无限循环
- **实现位置**：自动切换逻辑在各自的 Vue 组件中实现（`mounted` 生命周期钩子）
- **资源管理**：组件销毁时会自动清除定时器，防止内存泄漏

**使用场景**：适合在展示大屏或监控屏幕上自动轮播展示不同看板内容，无需人工操作即可循环查看各个看板数据。

## 使用方式

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 3. 构建生产版本（输出至 dist/）
npm run build

# 4. 本地预览构建产物
npm run serve
```

### 开发时访问页面

启动开发服务器后，可以通过以下地址访问各个页面：
- 首页：`http://localhost:3000/`
- 看板1：`http://localhost:3000/board1.html`
- 看板2：`http://localhost:3000/board2.html`

## 如何添加新页面

如果您需要添加新的看板页面（例如 board3），请按以下步骤操作：

### 步骤1：创建页面目录和文件

在 `src/pages/` 下创建新目录，例如 `board3/`，然后创建两个文件：

**src/pages/board3/main.js**
```javascript
import Vue from 'vue'
import Board3 from './Board3.vue'

new Vue({
  render: h => h(Board3)
}).$mount('#app')
```

**src/pages/board3/Board3.vue**
```vue
<template>
  <div class="board3">
    <h1>看板3 - 您的看板名称</h1>
    <p>这是新创建的看板页面</p>
  </div>
</template>

<script>
export default {
  name: 'Board3'
}
</script>

<style scoped>
.board3 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}
</style>
```

### 步骤2：创建 HTML 入口文件

在项目根目录创建 `board3.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>看板3 - 您的看板名称</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Microsoft YaHei', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/pages/board3/main.js"></script>
</body>
</html>
```

### 步骤3：更新 vite.config.js

在 `vite.config.js` 的 `rollupOptions.input` 中添加新入口：

```javascript
rollupOptions: {
  input: {
    main: resolve(__dirname, 'index.html'),
    board1: resolve(__dirname, 'board1.html'),
    board2: resolve(__dirname, 'board2.html'),
    board3: resolve(__dirname, 'board3.html')  // 添加这一行
  }
}
```

### 步骤4：更新首页导航（可选）

在 `src/App.vue` 中添加新页面的导航链接。

## 部署说明

构建后的文件全部位于 `dist/` 目录，包含：
- `index.html` - 首页
- `board1.html` - 看板1
- `board2.html` - 看板2
- `assets/` - 打包后的 JS 和 CSS 文件

可直接拷贝到 IIS、Nginx、Apache 或静态资源 CDN。若部署到 IIS，需一并保留仓库中的 `web.config` 以处理前端路由刷新。

### IIS 部署注意事项

由于是多页面应用，每个 HTML 文件都可以直接访问。`web.config` 中的 URL 重写规则主要用于处理单页应用的路由，对于多页面应用，如果直接访问 HTML 文件，通常不需要特殊配置。但如果需要将根路径重定向到首页，可以保留现有配置。

## 开发建议

1. **组件复用**：如果多个看板页面需要共享组件，可以将公共组件放在 `src/components/` 目录中
2. **样式统一**：建议创建公共样式文件，在需要的地方引入
3. **数据接口**：可以在 `src/services/` 目录中创建接口封装层，统一处理 API 请求
4. **错误监控**：建议在关键组件中添加错误处理和日志上报，便于快速定位问题
5. **静态资源**：图片等静态资源放在 `public/` 目录，可通过 `/image/xxx.png` 直接引用

## 目前状态

- ✅ 多页面架构已搭建完成
- ✅ 首页、看板1、看板2 三个页面已创建
- ✅ Vite 多入口配置已完成
- ✅ 看板1和看板2之间已实现自动轮播功能（每5秒切换一次）
- ✅ 看板切换功能已支持配置文件管理（切换时间和看板列表）
- ⏳ 各页面内容为示例，需要根据实际业务需求进行开发
- ⏳ 公共组件目录为空，可按需添加共享组件
- ⏳ 数据接口层尚未接入，需要根据后端 API 进行封装

## 功能说明

### 看板自动轮播功能详解

**功能描述**：看板之间自动循环切换，实现轮播展示。切换时间和参与轮播的看板列表都通过配置文件统一管理。

**实现原理**：
1. 配置文件 `src/config/boardSwitch.js` 定义了切换间隔和看板列表
2. 每个看板组件在 `mounted` 生命周期钩子中读取配置
3. 根据当前看板的ID，从配置中找到下一个要切换的看板
4. 使用 `setTimeout` 在指定时间后跳转到下一个看板页面
5. 在 `beforeDestroy` 生命周期钩子中清除定时器，防止内存泄漏

**代码位置**：
- 配置文件：`src/config/boardSwitch.js`
- 工具函数：`src/utils/boardSwitch.js`
- 看板1组件：`src/pages/board1/Board1.vue`
- 看板2组件：`src/pages/board2/Board2.vue`

### 配置文件使用说明

#### 配置文件位置
`src/config/boardSwitch.js`

#### 配置项说明

**1. switchInterval（切换间隔时间）**
- 类型：`number`
- 单位：毫秒
- 默认值：`5000`（5秒）
- 说明：控制每个看板页面显示多长时间后自动切换到下一个看板

**2. boards（看板列表）**
- 类型：`array`
- 说明：参与轮播的看板列表，按照数组顺序循环切换
- 每个看板对象包含：
  - `id`：看板唯一标识（必须与组件中的 `currentBoardId` 对应）
  - `name`：看板显示名称（用于说明，不影响功能）
  - `path`：看板页面的访问路径（相对于网站根目录）

#### 配置示例

```javascript
export default {
  // 切换间隔：10秒
  switchInterval: 10000,
  
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
    }
  ]
}
```

#### 如何修改配置

**修改切换时间**：
在 `src/config/boardSwitch.js` 中修改 `switchInterval` 的值：
```javascript
switchInterval: 3000,  // 改为3秒
```

**添加新看板**：
1. 在 `boards` 数组中添加新的看板对象
2. 确保 `id` 与对应组件中的 `currentBoardId` 一致
3. 确保 `path` 指向正确的HTML文件路径

**修改切换顺序**：
调整 `boards` 数组中看板的顺序即可改变切换顺序。

#### 注意事项

- 修改配置文件后，需要重新构建项目（`npm run build`）才能在生产环境生效
- 开发环境下，修改配置文件后刷新页面即可看到效果
- 每个看板组件的 `currentBoardId` 必须与配置文件中对应看板的 `id` 一致
- 如果配置文件中找不到当前看板，系统会默认跳转到第一个看板
- 最后一个看板的下一个会自动循环到第一个看板，实现无限循环
