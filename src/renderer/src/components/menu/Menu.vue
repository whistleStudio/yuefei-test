<template>
  <div class="w-full h-full flex flex-col">
    <header class="h-10 flex items-center justify-center">yuefei</header>
    <main class="flex flex-1">
      <ul class="flex flex-col items-center flex-2 gap-8">
        <li
          v-for="(item, index) in menuList"
          :key="index"
          @click="changeItem(index)"
          :class="['text-white h-6 cursor-pointer', { 'bg-blue-500': activeIndex === index }]"
        >
          {{ item.label }}
        </li>
      </ul>
      <div class="flex-5 bg-gray-950"></div>
    </main>
    <dialog id="control_modal" class="modal">
      <div class="modal-box bg-gray-500 w-80">
        <h3 class="text-lg font-bold mb-1">无人机控制</h3>
        <label class="input text-gray-900 mb-0.5 block">
          编号
          <input type="text" class="grow" placeholder="123456" v-model="planeId" />
        </label>
        <div class="modal-action">
          <form method="dialog" class="flex gap-4">
            <!-- if there is a button in form, it will close the modal -->
            <button class="btn btn-sm" @click="startControl">开启</button>
            <button class="btn btn-sm">关闭</button>
          </form>
        </div>
      </div>
    </dialog>
    <!-- <div role="alert" class="alert alert-warning">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>Warning: Invalid email address!</span>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const emit = defineEmits(['changeMenu'])

const menuList = [
  { name: 'mangement', label: '管理' },
  { name: 'annotation', label: '标注' },
  { name: 'airspace', label: '空域' },
  { name: 'route', label: '航线' },
  { name: 'live', label: '直播' },
  { name: 'control', label: '控制' },
  { name: 'test1', label: '测试1' },
  { name: 'test2', label: '测试2' }
]

const activeIndex = ref(0)

const changeItem = (index: number): void => {
  activeIndex.value = index
  console.log('index', index)
  emit('changeMenu', index)
  const label = menuList[index].label
  switch (label) {
    case '直播':
      window.electron.ipcRenderer.send('openLive')
      break
    case '控制':
      const controlModal = document.getElementById('control_modal') as HTMLDialogElement
      if (controlModal) {
        controlModal.showModal()
      }
      break
    case '测试1':
      loadDevices()
      break
    case '测试2':
      addNewDevice()
      break
    default:
      break
  }
}

// 开始控制
const planeId = ref('')
const startControl = (): void => {
  console.log('start control')
  if (planeId.value.trim() === '') {
    // 前端校验
    alert('请输入无人机编号')
    return
  }
  window.electron.ipcRenderer.send('startControl', planeId.value)
}

// 获取设备列表
async function loadDevices() {
  const devices = await window.electron.ipcRenderer.invoke('get-devices');
  console.log('设备列表:', devices);
  alert(`设备列表: ${JSON.stringify(devices)}`);
  // 更新 UI...
}

// 添加设备
async function addNewDevice() {
  const id = await window.electron.ipcRenderer.invoke('add-device', 'SN-20260327', 'Mavic 3 Enterprise');
  alert('添加成功，ID: ' + id);
  loadDevices(); // 刷新列表
}
</script>
