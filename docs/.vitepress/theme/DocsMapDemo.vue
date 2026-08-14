<template>
  <div class="docs-map-demo">
    <div class="docs-map-toolbar">
      <span><i :class="{ ready }"></i>{{ ready ? 'WebGL ready' : `Loading ${progress}%` }}</span>
      <div>
        <button type="button" @click="toggleBars">{{ barsVisible ? '隐藏柱图' : '显示柱图' }}</button>
        <button type="button" @click="refresh">刷新数据</button>
      </div>
    </div>
    <div class="docs-map-stage">
      <component
        :is="MapComponent"
        v-if="MapComponent"
        ref="mapRef"
        :data="mapData"
        @ready="ready = true"
        @progress="progress = $event.progress"
        @map-click="selected = $event?.name || ''"
      />
      <div v-if="selected" class="docs-map-selection">已选择：{{ selected }}</div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createMapData, provinceData } from '../../../example/data/map-data.js'

const MapComponent = shallowRef(null)
const mapRef = ref(null)
const ready = ref(false)
const progress = ref(0)
const selected = ref('')
const barsVisible = ref(true)
const mapData = createMapData()

onMounted(async () => {
  const module = await import('../../../src/index.js')
  MapComponent.value = module.BMap3D
})

function toggleBars() {
  barsVisible.value = !barsVisible.value
  mapRef.value?.setBarsVisible(barsVisible.value)
}

function refresh() {
  mapRef.value?.updateBars(
    provinceData.map((item) => ({
      ...item,
      value: Math.max(20, Math.min(100, item.value + Math.round(Math.random() * 30 - 15))),
    })),
  )
}

onBeforeUnmount(() => mapRef.value?.destroy())
</script>
