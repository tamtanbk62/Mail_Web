<template>
  <div class="mail-detail-wrapper" v-if="mail">
    <div class="mail-detail-header">
      <div class="mail-detail-subject">
        <span class="icon-mail">📧</span>
        <span>{{ mail.subject }}</span>
      </div>
      <div class="mail-detail-date">{{ new Date(mail.date).toLocaleString('vi-VN') }}</div>
    </div>
    <div class="mail-detail-body">
      <div class="mail-detail-from">
        <span class="avatar">{{ mail.from ? mail.from.charAt(0).toUpperCase() : '?' }}</span>
        <span class="from-info">{{ mail.from }}</span>
      </div>
      <div class="mail-detail-content">{{ mail.body }}</div>
    </div>
    <div v-if="mail.attachments && mail.attachments.length" class="mail-detail-attachments">
      <h2>Đính kèm:</h2>
      <ul>
        <li v-for="(file, index) in mail.attachments" :key="index">
          <a :href="`data:${file.contentType};base64,${file.content}`" :download="file.filename" class="attachment-link">
            <span class="icon-attach">📎</span> {{ file.filename }} ({{ (file.size / 1024).toFixed(1) }} KB)
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="mail-detail-status">
    <span class="icon-status">⏳</span>
    <span>Đang tải thư...</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import api from '@/services/services.js'

const route = useRoute()
const mail = ref(null)
const uid = route.params.uid

onMounted(async () => {
  const accessToken = localStorage.getItem('accessToken')
  const email = localStorage.getItem('userEmail')
  const password = localStorage.getItem('userPassword')

  try {
    const res = await axios.get(api.mailByUid(uid), {
      headers: {
        'x-access-token': accessToken,
        'x-user-email': email,
        'x-user-password': password
      }
    })
    mail.value = res.data
  } catch (err) {
    console.error('Error fetching mail by UID:', err)
  }
})
</script>

<style scoped>
.mail-detail-wrapper {
  max-width: 650px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(99,102,241,0.08);
  padding: 32px 28px 24px 28px;
}
.mail-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.mail-detail-subject {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #4f46e5;
}
.icon-mail {
  font-size: 1.5rem;
}
.mail-detail-date {
  color: #888;
  font-size: 1.02rem;
  font-weight: 500;
}
.mail-detail-body {
  margin-bottom: 18px;
}
.mail-detail-from {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
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
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.10);
}
.from-info {
  font-weight: 600;
  color: #374151;
  font-size: 1.05rem;
}
.mail-detail-content {
  color: #444;
  font-size: 1.08rem;
  background: #f9fafb;
  border-radius: 8px;
  padding: 18px 16px;
  white-space: pre-line;
  margin-bottom: 0;
  box-shadow: 0 2px 8px 0 rgba(99,102,241,0.04);
}
.mail-detail-attachments {
  margin-top: 24px;
}
.mail-detail-attachments h2 {
  font-size: 1.08rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 8px;
}
.mail-detail-attachments ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.mail-detail-attachments li {
  margin-bottom: 6px;
}
.attachment-link {
  color: #2563eb;
  text-decoration: underline;
  font-weight: 600;
  font-size: 1rem;
  transition: color 0.18s;
}
.attachment-link:hover {
  color: #f43f5e;
}
.icon-attach {
  margin-right: 6px;
}
.mail-detail-status {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  font-style: italic;
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.icon-status {
  font-size: 2.2rem;
}
</style>