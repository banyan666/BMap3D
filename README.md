# BMap3D

基于 Vue 3、Three.js、d3-geo 与 GSAP 的可交互 3D 行政区地图组件。项目已经包含组件源码、全国底图与纹理资源、陕西省完整示例、类型声明、库构建配置和 VitePress 文档站。

项目通过 GitHub Actions 自动发布：

- 示例页面：`https://banyan666.github.io/BMap3D/`
- 组件文档：`https://banyan666.github.io/BMap3D/docs/`

## 本地运行

```bash
pnpm install
pnpm dev
```

默认示例地址为 `http://localhost:5173`。文档站使用：

```bash
pnpm docs:dev
```

## 构建

```bash
pnpm build          # 组件库输出到 dist/
pnpm build:example  # 示例站输出到 example-dist/
pnpm docs:build     # 文档站输出到 docs/.vitepress/dist/
pnpm check          # 执行全部检查与构建
```

## 使用

```js
import { BMap3D } from 'b-map3d'
import 'b-map3d/style.css'
```

```vue
<template>
  <div class="map-host">
    <BMap3D :data="mapData" @ready="handleReady" />
  </div>
</template>

<style>
.map-host {
  width: 100%;
  height: 640px;
}
</style>
```

`mapData.mapJson` 是需要展示的区域 GeoJSON，完整数据结构、事件和实例方法请查看 `docs/`。

## 目录

```text
three-map/
├─ src/                 组件与 mini3d 运行时源码
├─ types/               公共类型声明
├─ example/             可交互示例及示例 GeoJSON
├─ docs/                VitePress 文档
├─ dist/                组件构建产物（构建后生成）
└─ example-dist/        示例构建产物（构建后生成）
```

该仓库暂未声明开源许可证，发布或分发前请根据实际归属补充许可证。
