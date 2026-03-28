<template>
<div class="w-full h-full"></div>
</template>


<script setup lang="ts">
import FlvJs from 'flv.js';
import { onMounted } from 'vue';

onMounted(() => {
  if (FlvJs.isSupported()) {
    const videoElement = document.createElement('video');
    videoElement.setAttribute('controls', ''); // 添加控制栏
    videoElement.setAttribute('autoplay', ''); // 自动播放
    videoElement.style.width = '100%'; // 设置视频宽度为100%
    videoElement.style.height = '100%'; // 设置视频高度为100%
    document.querySelector('.w-full')?.appendChild(videoElement); // 将视频元素添加到页面中

    const flvPlayer = FlvJs.createPlayer({
      type: 'flv',
      url: 'rtmp://liteavapp.qcloud.com/live/liteavdemoplayerstreamid' // 替换为你的FLV流地址
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
  } else {
    console.error('Flv.js is not supported in this browser.');
  }
})
</script>

