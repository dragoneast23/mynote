<template>
  <div class="min-h-screen bg-bg">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="font-medium text-gray-800">修改密码</span>
      <div class="w-6"></div>
    </div>

    <div class="pt-16 px-4">
      <div class="card p-6 mb-4">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">{{ (user?.nickname || user?.username || '?')[0] }}</span>
          </div>
          <p class="text-gray-800 font-medium">{{ user?.nickname || user?.username }}</p>
          <p class="text-gray-400 text-sm">当前账户</p>
        </div>
      </div>

      <div class="card p-6">
        <div class="space-y-4">
          <input 
            v-model="form.oldPassword"
            type="password" 
            placeholder="原密码" 
            class="input-field w-full"
          />
          <input 
            v-model="form.newPassword"
            type="password" 
            placeholder="新密码" 
            class="input-field w-full"
          />
          <input 
            v-model="form.confirmPassword"
            type="password" 
            placeholder="确认新密码" 
            class="input-field w-full"
          />
          
          <div class="flex gap-3">
            <button 
              @click="goBack"
              class="flex-1 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              @click="handleChange"
              class="btn-primary flex-1 py-3"
            >
              确认修改
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../api'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const goBack = () => {
  window.location.href = '/notes'
}

const handleChange = async () => {
  if (!form.value.oldPassword || !form.value.newPassword || !form.value.confirmPassword) {
    alert('请填写完整信息')
    return
  }
  
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('两次密码不一致')
    return
  }

  try {
    const res = await auth.changePassword(form.value)
    if (res.code === 0) {
      alert(res.msg)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('修改失败')
  }
}
</script>
