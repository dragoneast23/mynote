<template>
  <div class="min-h-screen bg-bg">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="font-medium text-gray-800">导出备忘录</span>
      <div class="w-6"></div>
    </div>

    <div class="pt-16 px-4 pb-24">
      <div class="card p-6">
        <h3 class="font-medium text-gray-800 mb-4">预览:</h3>
        
        <div class="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto mb-4">
          <pre class="text-sm text-gray-600 whitespace-pre-wrap">{{ exportContent }}</pre>
          <div v-if="!exportContent" class="text-gray-400 text-center py-8">
            暂无导出内容
          </div>
        </div>

        <div class="space-y-3">
          <button 
            @click="handleExport"
            class="btn-primary w-full py-3"
          >
            载入全部备忘录
          </button>
          
          <button 
            v-if="exportContent"
            @click="copyContent"
            class="w-full py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            复制内容到剪贴板
          </button>
          
          <button 
            @click="goBack"
            class="w-full py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { notes } from '../api'

const exportContent = ref('')

const handleExport = async () => {
  try {
    const res = await notes.export()
    if (res.code === 0) {
      exportContent.value = res.data.content
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('导出失败')
  }
}

const copyContent = async () => {
  if (!exportContent.value) return
  await navigator.clipboard.writeText(exportContent.value)
  alert('已复制内容')
}

const goBack = () => {
  window.location.href = '/notes'
}
</script>
