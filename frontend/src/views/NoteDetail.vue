<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="font-medium text-gray-800">备忘录详情</span>
      <div class="w-6"></div>
    </div>

    <div v-if="note" class="flex-1 pt-16 pb-20 px-4">
      <input 
        v-model="form.title"
        type="text" 
        class="w-full text-xl font-medium border-none bg-transparent focus:outline-none mb-4"
      />
      
      <div class="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>{{ formatDate(note.update_time) }}</span>
        <span>{{ wordCount }} 字</span>
      </div>

      <textarea 
        v-model="form.content"
        class="w-full h-full min-h-[60vh] resize-none border-none bg-transparent focus:outline-none text-gray-700 leading-relaxed"
        @input="updateWordCount"
      ></textarea>
    </div>

    <div v-if="note" class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3">
      <button 
        @click="handleDelete"
        class="btn-danger flex-1 py-3"
      >
        删除
      </button>
      <button 
        @click="handleSave"
        class="btn-primary flex-1 py-3"
      >
        保存
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { notes } from '../api'

const noteId = window.location.pathname.split('/').pop()
const note = ref(null)
const form = ref({
  title: '',
  content: ''
})

const wordCount = computed(() => form.value.content.length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const updateWordCount = () => {}

const loadNote = async () => {
  try {
    const res = await notes.getOne(noteId)
    if (res.code === 0) {
      note.value = res.data
      form.value = {
        title: res.data.title,
        content: res.data.content
      }
    } else {
      alert(res.msg)
      window.location.href = '/notes'
    }
  } catch (error) {
    alert('加载失败')
    window.location.href = '/notes'
  }
}

const saveNote = async () => {
  if (!note.value) return
  if (form.value.title === note.value.title && form.value.content === note.value.content) return
  
  try {
    await notes.update(noteId, {
      title: form.value.title || '无标题',
      content: form.value.content
    })
  } catch (error) {
    console.error('自动保存失败')
  }
}

const goBack = async () => {
  await saveNote()
  window.location.href = '/notes'
}

const handleSave = async () => {
  if (!form.value.title && !form.value.content) {
    alert('内容不能为空')
    return
  }

  try {
    const res = await notes.update(noteId, {
      title: form.value.title || '无标题',
      content: form.value.content
    })
    
    if (res.code === 0) {
      alert('保存成功')
      window.location.href = '/notes'
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('保存失败')
  }
}

window.addEventListener('beforeunload', async (e) => {
  await saveNote()
})

const handleDelete = async () => {
  if (!confirm('确定删除这条备忘录？')) return
  
  try {
    const res = await notes.delete(noteId)
    if (res.code === 0) {
      alert('删除成功')
      window.location.href = '/notes'
    } else {
      alert(res.msg)
    }
  } catch (error) {
    alert('删除失败')
  }
}

onMounted(() => {
  loadNote()
})
</script>
