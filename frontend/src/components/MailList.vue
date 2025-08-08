<template>
  <div class="mail-list-wrapper">
    <div class="mail-list-header">
      <h2><span class="icon-inbox">📥</span> Hộp thư đến</h2>
      <div class="mail-list-actions">
        <select v-model="searchType" class="search-type-select">
          <option value="all">Tất cả</option>
          <option value="subject">Subject</option>
          <option value="body">Nội dung</option>
        </select>
        <div class="search-input-wrapper">
          <input
            v-model="search"
            class="search-input"
            type="text"
            :placeholder="searchType === 'subject' ? 'Tìm theo subject...' : (searchType === 'body' ? 'Tìm theo nội dung...' : 'Tìm kiếm subject hoặc nội dung...')"
          />
          <button v-if="search" class="clear-search-btn" @click="search = ''" type="button" title="Xoá nội dung tìm kiếm">×</button>
        </div>
        <button class="refresh-btn" @click="fetchInbox" :disabled="loading">
          <span v-if="loading" class="loader"></span>
          <span v-else>↻ Tải lại</span>
        </button>
      </div>
    </div>
    <div v-if="loading" class="mail-list-status loading">Đang tải thư...</div>
    <div v-else-if="error" class="mail-list-status error">{{ error }}</div>
    <div v-else>
      <ul class="mail-list">
        <li 
          v-for="mail in pagedInbox" 
          :key="mail.uid" 
          class="mail-item" 
          @click="goToDetail(mail.uid)"
        >
          <div class="mail-item-row">
            <div class="mail-sender">
              <span class="avatar">{{ getSenderName(mail.from).charAt(0).toUpperCase() }}</span>
              <div class="sender-info">
                <span class="sender-name">{{ getSenderName(mail.from) }}</span>
                <span class="sender-email">&lt;{{ getSenderEmail(mail.from) }}&gt;</span>
              </div>
            </div>
            <div class="mail-date">{{ formatDate(mail.date) }}</div>
          </div>
          <div class="mail-subject">{{ mail.subject }}</div>
          <div class="mail-body line-clamp-2">{{ mail.body }}</div>
        </li>
      </ul>
      <div v-if="filteredInbox.length === 0" class="mail-list-status empty">Không có thư nào.</div>
      <div v-else class="pagination-bar">
        <button class="page-btn" :disabled="page === 1" @click="prevPage">&lt;</button>
        <span class="page-info">Trang {{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="nextPage">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import api from '@/services/services.js'
const router = useRouter()

const goToDetail = (uid) => {
  router.push(`/inbox/${uid}`)
}

const inbox = ref([])
const loading = ref(true)
const error = ref(null)
const page = ref(1)
const pageSize = 5
const search = ref('')
const searchType = ref('all')

const accessToken = localStorage.getItem('accessToken')
const email = localStorage.getItem('userEmail')
const password = localStorage.getItem('userPassword')

const socket = io(api.API_BASE_URL)

const filteredInbox = computed(() => {
  if (!search.value.trim()) return inbox.value
  const q = search.value.trim().toLowerCase()
  if (searchType.value === 'subject') {
    return inbox.value.filter(mail => mail.subject && mail.subject.toLowerCase().includes(q))
  } else if (searchType.value === 'body') {
    return inbox.value.filter(mail => mail.body && mail.body.toLowerCase().includes(q))
  } else {
    return inbox.value.filter(
      mail =>
        (mail.subject && mail.subject.toLowerCase().includes(q)) ||
        (mail.body && mail.body.toLowerCase().includes(q))
    )
  }
})

const pagedInbox = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredInbox.value.slice(start, start + pageSize)
})
const totalPages = computed(() => Math.ceil(filteredInbox.value.length / pageSize) || 1)

const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}

const fetchInbox = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await axios.get(api.inbox, {
      headers: {
        'x-access-token': accessToken,
        'x-user-email': email,
        'x-user-password': password
      }
    })
    inbox.value = res.data.reverse()
    page.value = 1
  } catch (err) {
    error.value = 'Không thể tải inbox.'
  } finally {
    loading.value = false
  }
}

const fetchMailByUid = async (uid) => {
  try {
    const res = await axios.get(api.mailByUid(uid), {
      headers: {
        'x-access-token': accessToken,
        'x-user-email': email,
        'x-user-password': password
      }
    })

    if (!inbox.value.find(m => m.uid === uid)) {
      inbox.value.unshift(res.data)
    }
  } catch (err) {
    console.error('Lỗi lấy mail mới:', err)
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleString('vi-VN')

const getSenderName = (from) => {
  const match = from.match(/^"?([^"<]*)"?\s*</)
  const name = match ? match[1] : from
  return name.split('@')[0] || "Unknown"
}

const getSenderEmail = (from) => {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from
}

onMounted(() => {
  fetchInbox()

  socket.emit('start-watch', { email, password })

  socket.on('new-mail', (data) => {
    if (data.email === email) {
      if(data.uid) {
        fetchMailByUid(data.uid)
      } else {
        fetchInbox()
      }
    }
  })
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
.mail-list-wrapper {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(99, 102, 241, 0.08);
  padding: 32px 28px 24px 28px;
}

.mail-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.mail-list-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-inbox {
  font-size: 1.5rem;
}

.mail-list-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-type-select {
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font-size: 1rem;
  background: #f9fafb;
  transition: border 0.2s;
}

.search-type-select:focus {
  border: 1.5px solid #6366f1;
  outline: none;
  background: #fff;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background: #f9fafb;
  transition: border 0.2s;
  min-width: 220px;
}

.search-input:focus {
  border: 1.5px solid #6366f1;
  outline: none;
  background: #fff;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #888;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.18s;
}

.clear-search-btn:hover {
  color: #f43f5e;
}

.refresh-btn {
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loader {
  border: 2px solid #e0e7ff;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.mail-list-status {
  text-align: center;
  margin: 32px 0 0 0;
  font-size: 1.1rem;
}

.mail-list-status.error {
  color: #f43f5e;
}

.mail-list-status.loading {
  color: #6366f1;
}

.mail-list-status.empty {
  color: #888;
  font-style: italic;
}

.mail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mail-item {
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.04);
  padding: 18px 20px 14px 20px;
  margin-bottom: 18px;
  transition: box-shadow 0.18s, border 0.18s, background 0.18s;
  cursor: pointer;
}

.mail-item:hover {
  background: #f1f5ff;
  border: 1.5px solid #6366f1;
  box-shadow: 0 4px 16px 0 rgba(99, 102, 241, 0.10);
}

.mail-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.mail-sender {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.10);
}

.sender-info {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.sender-name {
  font-weight: 700;
  color: #374151;
  font-size: 1.05rem;
}

.sender-email {
  color: #6366f1;
  font-size: 0.97rem;
}

.mail-date {
  color: #888;
  font-size: 0.98rem;
  font-weight: 500;
}

.mail-subject {
  font-size: 1.13rem;
  font-weight: 700;
  color: #22223b;
  margin-bottom: 2px;
  margin-top: 2px;
}

.mail-body {
  color: #444;
  font-size: 1.01rem;
  margin-bottom: 0;
}

/* Dòng dưới giúp hiển thị body gọn gàng với 2 dòng */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
}

.page-btn {
  background: #fff;
  border: 1.5px solid #6366f1;
  color: #6366f1;
  font-weight: 700;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1.08rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 1.08rem;
  color: #374151;
  font-weight: 600;
}
</style>