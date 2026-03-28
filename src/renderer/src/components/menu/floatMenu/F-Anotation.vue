<template>
  <div class="absolute top-10 right-10 w-10 h-40 bg-amber-500">
    <ul class="flex flex-col items-center justify-center h-full gap-4 cursor-pointer">
      <li v-for="value in toolList" :key="value.value" @click="handleAnotation(value)">
        {{ value.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useMapStore } from '@renderer/store/useMapStore'
import * as mars3d from 'mars3d'
const mapStore = useMapStore()
// console.log(mapStore.map)

const addPointCb = (ev) => {
  console.log('addPointCb', ev)
  const pos = ev.cartesian
  const graphic = new mars3d.graphic.PointEntity({
    position: pos,
    style: {
      color: '#ff0000',
      pixelSize: 10,
      outlineColor: '#ffffff',
      outlineWidth: 2,
      label: {
        text: '我是原始点',
        font_size: 18,
        color: '#ffffff',
        pixelOffsetY: -10,
        distanceDisplayCondition: true,
        distanceDisplayCondition_far: 500000,
        distanceDisplayCondition_near: 0
      }
    },
    attr: { remark: 'test' }
  })
  // const point = mars3d.LngLatPoint.fromCartesian(ev.cartesian)
  // console.log("point", point)
  mapStore.map.graphicLayer.addGraphic(graphic)
  // 添加记录
  mapStore.graphicRecord.push(graphic)
}
const addLineCb = (ev) => {
  console.log('addLineCb', ev)
}
const addPolygonCb = (ev) => {
  console.log('addPolygonCb', ev)
}
const undoCb = () => {
  const record = mapStore.graphicRecord.pop()
  if (record) {
    mapStore.graphicLayer.removeGraphic(record)
  }
}

const toolList = [
  { label: '点', value: 'point', cb: addPointCb },
  { label: '线', value: 'line', cb: addLineCb },
  { label: '面', value: 'polygon', cb: addPolygonCb },
  { label: '撤销', value: 'undo', cb: undoCb }
]

let curListener: any = null

const handleAnotation = (tool: any) => {
  if (!mapStore.map) return
  ;(mapStore.map as mars3d.Map).off(mars3d.EventType.click, curListener)
  if (tool.value === 'undo') {
    tool.cb()
    return
  }
  curListener = tool.cb
  ;(mapStore.map as mars3d.Map).on(mars3d.EventType.click, curListener)
}
</script>
