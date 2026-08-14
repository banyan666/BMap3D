# 动态更新

组件支持替换完整 `data`，也支持通过 ref 局部更新。高频业务数据建议使用局部方法，避免重建无关图层。

## 更新区域柱图

```vue
<script setup>
import { ref } from 'vue'

const mapRef = ref(null)

function updateMetrics(nextRows) {
  mapRef.value?.updateBars(nextRows)
}
</script>

<template>
  <BMap3D ref="mapRef" :data="mapData" />
</template>
```

## 更新信息点

```js
mapRef.value?.updateInfoPoints([
  {
    name: '西安临时监测站',
    lon: 108.797426,
    lat: 34.10671,
    value: 5,
    items: [{ name: '今日告警', value: 1, unit: '条' }],
  },
])
```

传入空数组会移除对应图层的数据。

## 动态开关图层

```js
mapRef.value?.setBarsVisible(false)
mapRef.value?.setInfoPointVisible(true)
mapRef.value?.setFlyLineVisible(false)
mapRef.value?.setDiffuseVisible(true)
mapRef.value?.setRotateBorderVisible(true)
```

## 替换地图

```js
mapRef.value?.updateData({
  mapJson: nextGeoJson,
  mapStroke: nextStrokeGeoJson,
  geoProjectionCenter: [108.887114, 35.263661],
  geoProjectionScale: 85,
  flyLineCenter: [108.948024, 34.263161],
})
```

替换 GeoJSON、投影中心或投影缩放会重建地图主体、标签、柱图、飞线、信息点和描边。颜色主题更新也会触发场景主题重建。

## 生命周期

组件在 Vue 卸载时会自动销毁。只有需要提前移除场景、但保留组件节点时，才需要手动调用：

```js
mapRef.value?.destroy()
```

`destroy()` 是幂等操作；重复调用不会重复释放 WebGL 上下文。
