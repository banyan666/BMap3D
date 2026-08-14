# 自定义资源

组件默认创建 `Assets` 并加载包内的纹理和全国 GeoJSON。大多数场景无需关心资源管理。

## 手动创建资源

在多个地图之间共享加载时机，或希望自行展示资源进度时，可以关闭自动加载：

```vue
<script setup>
import { shallowRef } from 'vue'
import { Assets } from 'b-map3d'

const assets = shallowRef(new Assets())

assets.value.instance.on('onProgress', (path, loaded, total) => {
  console.log(path, loaded, total)
})
</script>

<template>
  <BMap3D :assets="assets" :auto-load="false" :data="mapData" />
</template>
```

传入的对象需要包含 `instance`，并提供以下能力：

- `getResource(name)`：按组件约定名称返回加载结果。
- `on(event, handler)`：监听 `onProgress`、`onLoad` 和 `onError`。
- `loadAll(items)`：加载资源清单。
- `destroy()`：解绑事件并释放持有的数据。

## 内置资源名称

| 名称 | 用途 |
| --- | --- |
| `china` | 全国底图 GeoJSON |
| `pathLine` / `pathLine2` / `pathLine3` | 飞线与流光纹理 |
| `rotationBorder1` / `rotationBorder2` | 旋转边界 |
| `chinaBlurLine` | 全国底图模糊边缘 |
| `guangquan1` / `guangquan2` | 柱图底部光圈 |
| `huiguang` | 柱图辉光 |
| `ocean` | 底部海洋背景 |
| `mapFlyline` | 地图飞线 |
| `point` | 信息点 |
| `focusArrows` / `focusBar` / `focusBg` / `focusMidQuan` / `focusMoveBg` | 中心聚焦动画 |

替换资源时应保持名称和数据类型一致。纹理返回 Three.js `Texture`，`china` 返回 JSON 文本并由场景解析。

::: warning
组件销毁时，自动创建的 `Assets` 会一并销毁；外部传入的共享资源不会由组件主动销毁，资源所有者应在合适时机调用 `assets.instance.destroy()`。
:::
