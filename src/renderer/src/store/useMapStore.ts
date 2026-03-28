import { graphic } from "mars3d";
import { defineStore } from "pinia";

export const useMapStore = defineStore("map", {
  state: () => ({
    map: null as any,
    graphicLayer: null as any,
    graphicRecord: [] as graphic.BaseGraphic[],
  })
})