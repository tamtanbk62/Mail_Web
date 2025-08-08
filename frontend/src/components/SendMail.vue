<template>
  <div class="compose-wrapper">
    <h2 class="compose-title">✉️ Soạn thư mới</h2>

    <form class="compose-form" @submit.prevent="sendEmail">
      <div class="form-group">
        <label>Tới</label>
        <input v-model="to" required placeholder="Email người nhận" />
      </div>

      <div class="form-group">
        <label>Chủ đề</label>
        <input v-model="subject" required placeholder="Email subject" />
      </div>

      <div class="form-group">
        <label>Nội dung</label>
        <textarea v-model="message" required placeholder="Nội dung mail..."></textarea>
      </div>

      <div class="form-group">
        <label>Tệp đính kèm</label>
        <input type="file" @change="handleFile" />
      </div>

      <button class="send-btn" type="submit">📤 Gửi</button>

      <p v-if="status" :style="{ color: statusColor }" class="status-text">
        {{ status }}
      </p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import api from '@/services/services.js'

export default {
  data() {
    return {
      to: '',
      subject: '',
      message: '',
      file: null,
      status: '',
      statusColor: 'green'
    }
  },
  methods: {
    handleFile(e) {
      this.file = e.target.files[0]
    },
    async sendEmail() {
      const formData = new FormData()
      formData.append('to', this.to)
      formData.append('subject', this.subject)
      formData.append('message', this.message)
      if (this.file) {
        formData.append('attachment', this.file)
      }

      const accessToken = localStorage.getItem('accessToken')
      const email = localStorage.getItem('userEmail')
      const password = localStorage.getItem('userPassword')

      try {
        const res = await axios.post(api.sendMail, formData, {
          headers: {
            'x-access-token': accessToken,
            'x-user-email': email,
            'x-user-password': password,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.status = '✅ ' + res.data.message
        this.statusColor = 'green'
        this.to = ''
        this.subject = ''
        this.message = ''
      } catch (err) {
        this.status = '❌ ' + (err.response?.data?.error || 'Error sending mail')
        this.statusColor = 'red'
      }
    }
  }
}
</script>

<style scoped>
.compose-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.06);
}

.compose-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 24px;
}

.compose-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

input,
textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: #f9fafb;
  transition: border 0.2s;
}

input:focus,
textarea:focus {
  border: 1.5px solid #6366f1;
  background: #fff;
  outline: none;
}

textarea {
  min-height: 200px;
  resize: vertical;
}

.send-btn {
  align-self: flex-start;
  background: linear-gradient(90deg, #6366f1, #60a5fa);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
  transition: all 0.2s ease-in-out;
}

.send-btn:hover {
  background: linear-gradient(90deg, #4f46e5, #2563eb);
  transform: translateY(-1px);
}

.status-text {
  font-weight: 600;
  margin-top: 12px;
}
</style>