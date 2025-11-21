<template>
  <div class="app">
    <h1>MES 看板系统</h1>
    <div class="nav-links">
      <a href="/board1.html" class="nav-link">看板1 - 生产看板</a>
      <a href="/board2.html" class="nav-link">看板2 - 设备看板</a>
      <a href="/board3.html" class="nav-link">看板3 - 质量看板</a>
      <a href="/board4.html" class="nav-link">看板4 - 仓储看板</a>
      <a href="/board5.html" class="nav-link">看板5 - 能耗看板</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  font-size: 48px;
  margin-bottom: 40px;
  color: white;
}

.nav-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  display: inline-block;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
