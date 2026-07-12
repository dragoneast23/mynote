<template>
  <div class="min-h-screen bg-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="card p-6 fade-in">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">备忘录</h1>
          <p class="text-gray-500 text-sm">简单、高效的个人备忘录工具</p>
        </div>

        <div class="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
          <span>📝</span>
          <span>展示所有备忘录</span>
          <span>➕</span>
          <span>新增</span>
          <span>✍</span>
          <span>修改</span>
          <span>🗑</span>
          <span>删除</span>
        </div>

        <div class="bg-red-50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
          请登录个人账户以使用全部功能
        </div>

        <div class="mb-6">
          <button 
            @click="showScanHandler"
            class="w-full py-3 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.322-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
            </svg>
            微信快捷登录
          </button>
        </div>

        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-gray-400 text-sm">或者</span>
          <div class="flex-1 h-px bg-gray-200"></div>
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
          <button 
            @click="handleLogin"
            class="btn-primary w-full py-3"
          >
            登录
          </button>
        </div>

        <div class="text-center mt-4">
          <a href="/register" class="text-primary text-sm hover:underline">
            还没有账号？立即注册
          </a>
        </div>
      </div>
    </div>

    <div v-if="showWechatScan" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="card p-6 w-full max-w-sm fade-in">
        <div class="text-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">微信扫码登录</h3>
          <p class="text-gray-500 text-sm">请使用微信扫描二维码</p>
        </div>

        <div class="flex justify-center mb-4">
          <canvas ref="qrCodeRef" class="bg-white p-2 rounded-lg"></canvas>
        </div>

        <div class="text-center text-sm text-gray-500 mb-4">
          <p v-if="scanStatus === 'waiting'">等待扫码...</p>
          <p v-else-if="scanStatus === 'scanned'" class="text-green-500">已扫码，请在小程序中确认</p>
          <p v-else-if="scanStatus === 'confirmed'" class="text-green-500">登录成功！</p>
        </div>

        <button 
          @click="showWechatScan = false; scanStatus = 'waiting'; clearInterval(scanInterval)"
          class="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, onUnmounted } from 'vue';
import { auth } from '../api';
import QRCode from 'qrcode';
const form = ref({
 username: '',
 password: ''
});
const showWechatScan = ref(false);
const scanStatus = ref('waiting');
const qrCodeRef = ref(null);
const scanInterval = ref(null);
const handleLogin = async () => {
 if (!form.value.username || !form.value.password) {
 alert('请输入账号和密码');
 return;
 }
 try {
 const res = await auth.login(form.value);
 if (res.code === 0) {
 localStorage.setItem('token', res.data.token);
 localStorage.setItem('user', JSON.stringify(res.data));
 window.location.href = '/notes';
 }
 else {
 alert(res.msg);
 }
 }
 catch (error) {
 alert('登录失败');
 }
};
const handleWechatScan = async () => {
 try {
 const res = await auth.wechatScanLogin();
 if (res.code === 0) {
 const { scene, qrCodeContent } = res.data;
 await QRCode.toCanvas(qrCodeRef.value, qrCodeContent || scene, {
 width: 200,
 margin: 2
 });
 scanStatus.value = 'waiting';
 scanInterval.value = setInterval(async () => {
 try {
 const checkRes = await auth.wechatScanCheck(scene);
 if (checkRes.code === 0) {
 localStorage.setItem('token', checkRes.data.token);
 localStorage.setItem('user', JSON.stringify(checkRes.data));
 scanStatus.value = 'confirmed';
 clearInterval(scanInterval.value);
 setTimeout(() => {
 window.location.href = '/notes';
 }, 1000);
 }
 else if (checkRes.code === -2) {
 scanStatus.value = 'waiting';
 }
 else {
 clearInterval(scanInterval.value);
 alert(checkRes.msg);
 }
 }
 catch (error) {
 clearInterval(scanInterval.value);
 }
 }, 2000);
 }
 else {
 alert(res.msg);
 }
 }
 catch (error) {
 alert('获取二维码失败');
 }
};
const showScanHandler = async () => {
 showWechatScan.value = true;
 setTimeout(() => {
 handleWechatScan();
 }, 100);
};
onUnmounted(() => {
 if (scanInterval.value) {
 clearInterval(scanInterval.value);
 }
});
</script>
