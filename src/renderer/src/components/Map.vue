<template>
  <div id="mars3dContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'mars3d-cesium/Build/Cesium/Widgets/widgets.css'
import 'mars3d/mars3d.css'

import * as mars3d from 'mars3d'
import 'mars3d-space'
import { useMapStore } from '@renderer/store/useMapStore'

const map = ref<mars3d.Map>()
const mapStore = useMapStore()

const props = withDefaults(
  defineProps<{
    url: string
    mapKey?: string
    options?: any
  }>(),
  {
    url: '',
    mapKey: 'default',
    options: () => ({})
  }
)

onMounted(() => {
  console.log('[Map] loading config from url:', props.url)

  if (!props.url) {
    console.warn('[Map] props.url is empty, initialize with props.options only')
    initMars3d(props.options || {})
    return
  }

  // primary attempt via mars3d.Util.fetchJson
  mars3d.Util.fetchJson({ url: props.url })
    .then((data: any) => {
      console.log('[Map] config loaded (mars3d.Util.fetchJson):', props.url, data)
      try {
        initMars3d({
          ...data,
          ...props.options
        })
      } catch (err) {
        console.error('[Map] initMars3d threw:', err)
      }
    })
    .catch((err: any) => {
      console.error('[Map] mars3d.Util.fetchJson failed:', props.url, err)
      // fallback: try native fetch to get a clearer error / status
      fetch(props.url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
          return res.text()
        })
        .then((text) => {
          try {
            const json = JSON.parse(text)
            console.log('[Map] config loaded (fetch+JSON.parse):', props.url, json)
            initMars3d({
              ...json,
              ...props.options
            })
          } catch (parseErr) {
            console.error('[Map] Failed to parse config JSON:', parseErr)
            console.debug('[Map] Raw response text:', text)
            // fallback: initialize with minimal options so app doesn't hang
            initMars3d(props.options || {})
          }
        })
        .catch((fetchErr) => {
          console.error('[Map] fallback fetch failed:', fetchErr)
          // final fallback: initialize with minimal options so app doesn't hang
          initMars3d(props.options || {})
        })
    })
})

/* ----------------------------- */
const initMars3d = (option: any): void => {
  try {
    console.log('[Map] initMars3d options:', option)
    map.value = new mars3d.Map('mars3dContainer', option)
    mapStore.map = map.value
    // let layer = map.value.getLayer(123, 'id')
    // console.log('getLayer by id 123:', layer)
    // map.value.addLayer(layer)
    const graphicLayer = new mars3d.layer.GraphicLayer({ zIndex: 10 })
    map.value.addLayer(graphicLayer)
    mapStore.graphicLayer = graphicLayer
    map.value.on(mars3d.EventType.click, (event: any) => {
      console.log('click', event)
    })
  } catch (err) {
    console.error('[Map] Error creating mars3d.Map:', err)
    // If map creation failed, you can try a minimal init or show error UI.
    // Here we avoid leaving the app "silent". Do not rethrow to prevent app freeze.
  }
}
</script>