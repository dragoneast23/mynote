<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="font-medium text-gray-800">新建备忘录</span>
      <div class="w-6"></div>
    </div>

    <div class="flex-1 pt-16 pb-20 px-4">
      <input 
        v-model="form.title"
        type="text" 
        placeholder="请输入标题" 
        class="w-full text-xl font-medium border-none bg-transparent placeholder-gray-300 mb-4 focus:outline-none"
        @input="markChanged"
      />
      
      <div class="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>{{ formatDate(new Date()) }}</span>
        <span>{{ wordCount }} 字</span>
      </div>

      <textarea 
        v-model="form.content"
        placeholder="请输入内容..."
        class="w-full h-full min-h-[60vh] resize-none border-none bg-transparent placeholder-gray-300 focus:outline-none text-gray-700 leading-relaxed"
        @input="() => { updateWordCount(); markChanged(); }"
      ></textarea>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
      <button 
        @click="handleSave"
        class="btn-primary w-full py-3"
      >
        保存
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { notes } from '../api'

const form = ref({
  title: '',
  content: ''
})

const saved = ref(true)

const wordCount = computed(() => form.value.content.length)

const formatDate = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const updateWordCount = () => {}

const markChanged = () => {
  saved.value = false
}

const saveNote = async () => {
  if (saved.value || (!form.value.title && !form.value.content)) return
  
  try {
    await notes.add({
      title: form.value.title || '无标题',
      content: form.value.content
    })
    saved.value = true
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
    const res = await notes.add({
      title: form.value.title || '无标题',
      content: form.value.content
    })
    
    if (res.code === 0) {
      saved.value = true
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
</script>
