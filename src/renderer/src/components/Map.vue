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
  mars3d.Util.fetchJson({url: props.url}).then((data: any) => {
    console.log("data", data)
    initMars3d({
      ...data,
      ...props.options
    })
  })
})

/* ----------------------------- */
const initMars3d = (option: any): void => {
  map.value = new mars3d.Map('mars3dContainer', option)
  mapStore.map = map.value
  const graphicLayer = new mars3d.layer.GraphicLayer({zIndex: 10})
  map.value.addLayer(graphicLayer)
  mapStore.graphicLayer = graphicLayer
  map.value.on(mars3d.EventType.click, (event: any) => {
    console.log("click", event)
  })
}


// onMounted(() => {
//   map.value = new mars3d.Map('mars3dContainer', {
//     scene: {
//       // 默认视角参数
//       center: { lat: 30.054604, lng: 108.885436, alt: 17036414, heading: 0, pitch: -90 },
//       shadows: false, // 是否启用日照阴影
//       removeDblClick: true, // 是否移除Cesium默认的双击事件

//       // 以下是Cesium.Viewer所支持的options【控件相关的写在另外的control属性中】
//       sceneMode: 3, // 3等价于Cesium.SceneMode.SCENE3D,

//       // 以下是Cesium.Scene对象相关参数
//       showSun: true, // 是否显示太阳
//       showMoon: true, // 是否显示月亮
//       showSkyBox: true, // 是否显示天空盒
//       showSkyAtmosphere: true, // 是否显示地球大气层外光圈
//       fog: true, // 是否启用雾化效果
//       fxaa: true, // 是否启用抗锯齿

//       // 以下是Cesium.Globe对象相关参数
//       globe: {
//         depthTestAgainstTerrain: false, // 是否启用深度监测
//         baseColor: '#546a53', // 地球默认背景色
//         showGroundAtmosphere: true, // 是否在地球上绘制的地面大气
//         enableLighting: false // 是否显示昼夜区域
//       },
//       // 以下是Cesium.ScreenSpaceCameraController对象相关参数
//       cameraController: {
//         zoomFactor: 3.0, // 鼠标滚轮放大的步长参数
//         minimumZoomDistance: 1, // 地球放大的最小值（以米为单位）
//         maximumZoomDistance: 50000000, // 地球缩小的最大值（以米为单位）
//         enableRotate: true, // 2D和3D视图下，是否允许用户旋转相机
//         enableTranslate: true, // 2D和哥伦布视图下，是否允许用户平移地图
//         enableTilt: true, // 3D和哥伦布视图下，是否允许用户倾斜相机
//         enableZoom: true, // 是否允许 用户放大和缩小视图
//         enableCollisionDetection: true // 是否允许 地形相机的碰撞检测
//       }
//     },
//     control: {
//       baseLayerPicker: true, // basemaps底图切换按钮
//       homeButton: true, // 视角复位按钮
//       sceneModePicker: true, // 二三维切换按钮
//       navigationHelpButton: true, // 帮助按钮
//       fullscreenButton: true // 全屏按钮
//     },
//     terrain: {
//       url: 'http://data.mars3d.cn/terrain',
//       show: true
//     },
//     basemaps: [
//       {
//         name: '天地图影像(EPSG:3857)',
//         icon: 'https://data.mars3d.cn/img/thumbnail/basemap/tdt_img.png',
//         type: 'tdt',
//         layer: 'img_d',
//         key: mars3d.Token.tiandituArr,
//         // show: true
//       },
//       {
//         pid: 10,
//         name: '天地图电子',
//         icon: '/img/basemaps/tdt_vec.png',
//         type: 'group',
//         layers: [
//           { name: '底图', type: 'tdt', layer: 'vec_d' },
//           { name: '注记', type: 'tdt', layer: 'vec_z' }
//         ],
//         show: true
//       }
//     ]
//   })
// })
</script>
