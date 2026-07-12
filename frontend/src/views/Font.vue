<template>
  <div class="min-h-screen bg-bg">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-4 py-3 flex items-center justify-between">
      <button @click="goBack" class="text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="font-medium text-gray-800">字体大小设置</span>
      <div class="w-6"></div>
    </div>

    <div class="pt-16 px-4 pb-24">
      <div class="card p-6 mb-6">
        <h3 class="font-medium text-gray-800 mb-4">预览效果</h3>
        <div 
          class="text-gray-600 leading-relaxed"
          :style="{ fontSize: `${fontScale * 16}px` }"
        >
          <p class="mb-2">这是一段预览文本，用于展示字体大小的效果。</p>
          <p>调整下方滑块可以改变字体大小，设置会自动保存并应用到所有页面。</p>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="font-medium text-gray-800 mb-4">字体大小</h3>
        
        <input 
          type="range" 
          v-model="fontScale"
          min="0.8" 
          max="1.4" 
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          @input="saveFontScale"
        />
        
        <div class="flex justify-between text-sm text-gray-400 mt-2">
          <span>小</span>
          <span>{{ Math.round(fontScale * 100) }}%</span>
          <span>大</span>
        </div>

        <div class="grid grid-cols-4 gap-3 mt-6">
          <button 
            v-for="scale in fontPresets" 
            :key="scale.value"
            @click="setFontScale(scale.value)"
            class="py-2 rounded-lg border text-sm transition-colors"
            :class="fontScale === scale.value ? 'border-primary bg-primaryLight text-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
          >
            {{ scale.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
      <button 
        @click="goBack"
        class="btn-primary w-full py-3"
      >
        返回
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const fontScale = ref(1.0)
const fontPresets = [
  { label: '小', value: 0.8 },
  { label: '标准', value: 1.0 },
  { label: '大', value: 1.2 },
  { label: '超大', value: 1.4 }
]

const loadFontScale = () => {
  const saved = localStorage.getItem('fontScale')
  if (saved) {
    fontScale.value = parseFloat(saved)
  }
}

const saveFontScale = () => {
  localStorage.setItem('fontScale', fontScale.value.toString())
  document.documentElement.style.fontSize = `${fontScale.value * 16}px`
}

const setFontScale = (scale) => {
  fontScale.value = scale
  saveFontScale()
}

const goBack = () => {
  window.location.href = '/notes'
}

onMounted(() => {
  loadFontScale()
})
</script>
