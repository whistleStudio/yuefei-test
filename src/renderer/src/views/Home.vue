<template>
  <div class="w-full h-full flex">
    <Menu class="flex-1" @changeMenu="handleChangeMenu"></Menu>
    <Map :url="configUrl" class="flex-5" ></Map>
    <FAnotation v-show="activeMenuIndex === 1"></FAnotation>
  </div>
</template>


<script setup lang="ts">
import Map from '@renderer/components/Map.vue';
import Menu from '@renderer/components/menu/Menu.vue';
import FAnotation from '@renderer/components/menu/floatMenu/F-Anotation.vue';
const isDev = import.meta.env.DEV
// 'app.asar.unpacked', 'resources'
const resourcesPath = (window.api as any).resourcesPath()
const configUrl =  isDev ? import.meta.env.BASE_URL + 'config/config.json' : resourcesPath + '/app.asar.unpacked/resources/config/config.json';
import { ref } from 'vue'

const activeMenuIndex = ref(0)

console.log(import.meta.env.BASE_URL)
console.log("resourcepath", (window.api as any).resourcesPath())

const handleChangeMenu = (index: number): void => {
  activeMenuIndex.value = index
}
</script>

