<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="card p-6 fade-in">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">账号注册</h1>
        </div>

        <div class="space-y-4">
          <input 
            v-model="form.username"
            type="text" 
            placeholder="账号" 
            class="input-field w-full"
          />
          <input 
            v-model="form.password"
            type="password" 
            placeholder="密码" 
            class="input-field w-full"
          />
          <input 
            v-model="form.confirmPassword"
            type="password" 
            placeholder="确认密码" 
            class="input-field w-full"
          />
          <input 
            v-model="form.registercode"
            type="text" 
            placeholder="注册码" 
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
              @click="handleRegister"
              class="btn-primary flex-1 py-3"
            >
              注册
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

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  registercode: ''
})

const goBack = () => {
  window.location.href = '/'
}

const handleRegister = async () => {
  if (!form.value.username || !form.value.password || !form.value.registercode) {
    alert('请填写完整信息')
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    alert('两次密码不一致')
    return
  }

  try {
    const res = await auth.register({
      username: form.value.username,
      password: form.value.password,
      registercode: form.value.registercode
    })
    
    if (res.code === 0) {
      alert('注册成功，请登录')
      window.location.href = '/'
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('注册失败')
  }
}
</script>
