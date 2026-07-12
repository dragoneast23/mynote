<template>
  <div class="min-h-screen bg-bg">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="text-gray-600 hover:text-gray-800">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <input 
          v-model="keyword"
          type="text" 
          placeholder="搜索备忘录" 
          class="flex-1 bg-gray-100 rounded-lg px-4 py-2 outline-none"
          @input="handleSearch"
          autofocus
        />
        <button 
          v-if="keyword"
          @click="clearSearch"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="pt-20 pb-4 px-4">
      <div v-if="results.length === 0 && !loading" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <p class="text-gray-400">未找到匹配内容</p>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="text-gray-400">搜索中...</div>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="note in results" 
          :key="note.id"
          @click="goDetail(note.id)"
          class="card p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 class="font-medium text-gray-800 mb-2 truncate">{{ note.title || '无标题' }}</h3>
          <p class="text-gray-500 text-sm line-clamp-2">{{ note.content || '无内容' }}</p>
          <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>{{ formatDate(note.update_time) }}</span>
            <span>{{ note.word_count }} 字</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { notes } from '../api'

const keyword = ref('')
const results = ref([])
const loading = ref(false)
let searchTimeout = null

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    if (!keyword.value.trim()) {
      results.value = []
      return
    }
    
    loading.value = true
    try {
      const res = await notes.search(keyword.value)
      if (res.code === 0) {
        results.value = res.data
      }
    } catch (error) {
      console.error('搜索失败')
    }
    loading.value = false
  }, 300)
}

const clearSearch = () => {
  keyword.value = ''
  results.value = []
}

const goBack = () => {
  window.location.href = '/notes'
}

const goDetail = (id) => {
  window.location.href = `/notes/${id}`
}

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>
