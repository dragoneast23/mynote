<template>
  <div class="min-h-screen bg-bg">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3">
      <div class="flex items-center justify-between">
        <div 
          @click="goSearch"
          class="flex-1 bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span class="text-gray-400 text-sm">搜索备忘录</span>
        </div>
        <button 
          @click="toggleSettings"
          class="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>

      <div v-if="showSettings" class="absolute top-full left-0 right-0 bg-white shadow-lg border-t p-2 slide-up">
        <div class="px-4 py-2 text-gray-800 font-medium border-b">
          {{ user?.nickname || user?.username }}
        </div>
        <button @click="goAccount" class="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50">
          修改密码
        </button>
        <button @click="goFont" class="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50">
          字体设置
        </button>
        <button @click="goExport" class="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50">
          导出备忘录
        </button>
        <button @click="handleLogout" class="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50">
          退出账号
        </button>
      </div>
    </div>

    <div class="pt-20 pb-24 px-4">
      <div v-if="notes.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-gray-400">暂无备忘录</p>
        <button @click="goAdd" class="mt-4 text-primary hover:underline">
          立即添加
        </button>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="note in notes" 
          :key="note.id"
          @click="goDetail(note.id)"
          @contextmenu.prevent="showContextMenu($event, note)"
          class="card p-4 cursor-pointer hover:shadow-md transition-shadow"
          :class="{ 'bg-primaryLight': selectedId === note.id }"
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

    <button 
      @click="goAdd"
      class="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-10"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button>

    <div v-if="contextMenu.show" class="fixed bg-white rounded-lg shadow-xl p-2 z-50" :style="contextMenu.style">
      <button @click="copyNote" class="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 rounded">
        复制
      </button>
      <button @click="deleteNote" class="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50 rounded">
        删除
      </button>
      <button @click="contextMenu.show = false" class="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-50 rounded">
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { notes as notesApi, auth } from '../api'

const notes = ref([])
const showSettings = ref(false)
const selectedId = ref(null)
const contextMenu = ref({
  show: false,
  style: {},
  note: null
})

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const loadNotes = async () => {
  try {
    const res = await notesApi.getAll()
    if (res.code === 0) {
      notes.value = res.data
    }
  } catch (error) {
    console.error('加载备忘录失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goSearch = () => {
  window.location.href = '/search'
}

const goAdd = () => {
  window.location.href = '/notes/add'
}

const goDetail = (id) => {
  window.location.href = `/notes/${id}`
}

const goAccount = () => {
  showSettings.value = false
  window.location.href = '/settings/account'
}

const goFont = () => {
  showSettings.value = false
  window.location.href = '/settings/font'
}

const goExport = () => {
  showSettings.value = false
  window.location.href = '/settings/export'
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const handleLogout = async () => {
  if (!confirm('确定退出登录？')) return
  await auth.logout()
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}

const showContextMenu = (event, note) => {
  contextMenu.value = {
    show: true,
    style: {
      left: `${event.clientX}px`,
      top: `${event.clientY}px`
    },
    note
  }
}

const copyNote = () => {
  if (contextMenu.value.note) {
    navigator.clipboard.writeText(contextMenu.value.note.content || '')
    alert('已复制')
  }
  contextMenu.value.show = false
}

const deleteNote = async () => {
  if (!contextMenu.value.note) return
  if (!confirm('确定删除这条备忘录？')) {
    contextMenu.value.show = false
    return
  }
  
  try {
    const res = await notesApi.delete(contextMenu.value.note.id)
    if (res.code === 0) {
      loadNotes()
      alert('删除成功')
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('删除失败')
  }
  contextMenu.value.show = false
}

const handleClickOutside = (event) => {
  const target = event.target
  if (!target.closest('.card') && !target.closest('button') && contextMenu.value.show) {
    contextMenu.value.show = false
  }
}

onMounted(() => {
  loadNotes()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
