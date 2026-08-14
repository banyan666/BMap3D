# BMap3D 组件 API

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `BMap3DData` | `{}` | GeoJSON、图层数据和视觉配置。 |
| `assets` | `Assets \| null` | `null` | 外部资源管理对象。 |
| `autoLoad` | `boolean` | `true` | 未传 `assets` 时自动加载内置资源。 |
| `autoplay` | `boolean` | `true` | 场景创建后恢复 RAF 并播放入场动画。 |

`data.mapJson` 在场景创建时必填。若要延迟提供 GeoJSON，应同时设置 `:auto-load="false"`，准备好数据与资源后调用 `load(assets)`。

## Events

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `ready` | `Map3DWorld` | 资源完成、WebGL 场景创建后。 |
| `progress` | `LoadProgress` | 内置资源加载进度变化。 |
| `error` | `unknown` | 资源加载失败。 |
| `play-complete` | `void` | 入场时间线播放完成。 |
| `map-click` | `Record<string, unknown>` | 点击行政区且指针移动未超过阈值。 |

## ref 方法

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `load` | `Assets` | 使用指定资源创建场景。只在场景尚未创建时生效。 |
| `play` | — | 恢复 RAF 并继续入场时间线。 |
| `pause` | — | 暂停 RAF。 |
| `updateData` | `Partial<BMap3DData>` | 更新任意数据或配置。 |
| `updateBars` | `ProvinceDatum[]` | 局部更新区域柱图及关联飞线。 |
| `updateInfoPoints` | `InfoPointDatum[]` | 局部更新信息点。 |
| `setBarsVisible` | `boolean` | 显示或隐藏柱图。 |
| `setInfoPointVisible` | `boolean` | 显示或隐藏信息点。 |
| `setFlyLineVisible` | `boolean` | 显示或隐藏飞线。 |
| `setDiffuseVisible` | `boolean` | 显示或隐藏扩散效果。 |
| `setRotateBorderVisible` | `boolean` | 显示或隐藏旋转边界。 |
| `destroy` | — | 销毁场景并释放监听、动画和 WebGL 资源。 |

## 获取内部实例

```js
const world = mapRef.value?.world
```

模板 ref 会自动解包组件暴露的 `world` shallow ref，因此在组件外通常直接得到 `Map3DWorld | null`。

## TypeScript

包提供 `types/index.d.ts`，可导入公共类型：

```ts
import type {
  BMap3DData,
  BMap3DExpose,
  InfoPointDatum,
  ProvinceDatum,
} from 'b-map3d'
```
