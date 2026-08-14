# 快速开始

BMap3D 是面向 Vue 3 的数据驱动三维地图组件。外层容器负责确定地图尺寸，组件负责加载资源、创建 WebGL 场景、响应交互并释放资源。

## 环境要求

- Node.js 18 或更高版本
- Vue 3.4 或更高版本
- 支持 WebGL 的现代浏览器

## 安装依赖

在当前仓库开发：

```bash
pnpm install
pnpm dev
```

在同一台电脑的其他项目中以本地包方式安装：

```bash
pnpm add D:/project/github/myproject/three-map
```

如果直接使用仓库源码，则从 `src/index.js` 导入；使用构建产物时从包名导入：

```js
import { BMap3D } from 'b-map3d'
import 'b-map3d/style.css'
```

## 第一个地图

```vue
<template>
  <div class="map-host">
    <BMap3D
      ref="mapRef"
      :data="mapData"
      @ready="handleReady"
      @progress="handleProgress"
      @map-click="handleMapClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BMap3D } from 'b-map3d'
import 'b-map3d/style.css'
import cityMap from './city.json'

const mapRef = ref(null)

const mapData = {
  mapJson: cityMap,
  geoProjectionCenter: [108.887114, 35.263661],
  geoProjectionScale: 85,
  provinces: [
    { name: '西安市', centroid: [108.797426, 34.10671], value: 100 },
  ],
}

function handleReady(world) {
  console.log('scene ready', world)
}

function handleProgress(info) {
  console.log(`${info.progress}%`)
}

function handleMapClick(region) {
  console.log('selected region', region)
}
</script>

<style scoped>
.map-host {
  width: 100%;
  height: 640px;
}
</style>
```

## 全局注册

```js
import { createApp } from 'vue'
import BMap3DPlugin from 'b-map3d'
import 'b-map3d/style.css'
import App from './App.vue'

createApp(App).use(BMap3DPlugin).mount('#app')
```

注册后可在任意模板中使用 `<BMap3D />`。

## 容器尺寸

组件根节点使用 `width: 100%; height: 100%`。父容器必须提供明确高度，否则浏览器会把地图高度计算为 `0`。响应式布局中可以使用 `height: 100dvh`、固定高度或网格剩余空间。

::: tip
直接运行根目录的 `pnpm dev` 可以查看完整示例。示例使用 `example/data/陕西省.json`，可作为接入省级 GeoJSON 的参考。
:::
