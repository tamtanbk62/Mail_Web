<template>
  <div class="main-layout">
    <Sidebar class="sidebar" />
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
export default {
  components: { Sidebar }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background: #f4f6fb;
}
.sidebar {
  width: 250px;
  min-width: 220px;
  background: #fff;
  border-right: 1.5px solid #e5e7eb;
  box-shadow: 2px 0 12px 0 rgba(99,102,241,0.04);
  z-index: 10;
}
.content-area {
  flex: 1;
  padding: 32px 40px 32px 40px;
  overflow-y: auto;
  background: linear-gradient(120deg, #f0f4ff 0%, #e0e7ff 100%);
  min-width: 0;
}
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1.5px solid #e5e7eb;
    box-shadow: 0 2px 12px 0 rgba(99,102,241,0.04);
  }
  .content-area {
    padding: 18px 8px;
  }
}
</style>