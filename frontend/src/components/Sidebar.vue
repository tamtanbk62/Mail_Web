<template>
  <nav class="sidebar">
 
    <div class="sidebar-header">
      <img src="/favicon.ico" alt="Mail Logo" class="logo" />
      <span class="title">GGMail</span>
    </div>

    
    <ul class="nav-list">
      <li v-for="item in items" :key="item.path">
        <router-link :to="item.path" class="nav-link" active-class="active">
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    
    <div class="user-avatar" @click="toggleMenu">
      <span class="avatar">{{ userInitial }}</span>
      <div class="user-email">{{ userEmail }}</div>
      <transition name="fade">
        <div v-if="menuOpen" class="user-menu">
          <button class="logout-btn" @click.stop="logout">
            Đăng xuất
          </button>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script>
import { disconnectSocket } from '@/services/socket.js'
export default {
  data() {
    return {
      items: [
        { label: 'Hộp thư đến', path: '/inbox', icon: '📥' },
        { label: 'Soạn thư', path: '/compose', icon: '✉️' },
        { label: 'Bản nháp', path: '/drafts', icon: '🗂️' },
      ],
      menuOpen: false
    }
  },

  
  computed: {
    userEmail() {
      const userEmail = localStorage.getItem("userEmail") || ""
      return userEmail.split('@')[0]
    },
    userInitial() {
      return this.userEmail.charAt(0).toUpperCase();
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    logout() {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPassword");
      disconnectSocket()
      this.$router.push("/login");
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.03);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 10px;
}

.logo {
  width: 32px;
  height: 32px;
}

.title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #4f46e5;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  transition: 0.2s ease;
  border-left: 4px solid transparent;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-link.active {
  background-color: #eef2ff;
  color: #4f46e5;
  font-weight: 600;
  border-left: 4px solid #6366f1;
}

.icon {
  margin-right: 12px;
  font-size: 1.2rem;
}
.label {
  flex: 1;
}

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    flex-direction: row;
    align-items: center;
    padding: 0;
  }

  .sidebar-header {
    display: none;
  }

  .nav-list {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
  }

  .nav-link {
    flex-direction: column;
    padding: 10px 0;
    font-size: 0.85rem;
    justify-content: center;
    border-left: none;
    border-bottom: 2px solid transparent;
  }

  .nav-link.active {
    border-bottom: 2px solid #6366f1;
    background-color: transparent;
  }

  .icon {
    margin: 0;
  }
}

.user-avatar {
  margin-top: auto;
  padding: 32px 24px 24px 24px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px;
}

.avatar {
  display: inline-flex;
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
  background-color: #6366f1;
  color: white;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  user-select: none;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
}

.user-avatar:hover .avatar {
  background-color: #4f46e5;
}

.user-menu {
  position: absolute;
  bottom: 90px;
  left: 24px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(99,102,241,0.12);
  padding: 18px 18px 14px 18px;
  width: 210px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeIn 0.18s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-menu-avatar {
  width: 32px;
  height: 32px;
  font-size: 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
}

.user-email {
  font-size: 0.97rem;
  color: #374151;
  word-break: break-all;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #f43f5e 100%);
  color: white;
  border: none;
  padding: 10px 0;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(239,68,68,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
}

.logout-icon {
  font-size: 1.6rem;
  line-height: 1;
  display: flex;
  align-items: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.18s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>