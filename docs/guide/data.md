# 数据与配置

所有地图数据和视觉配置都通过 `data` Prop 传入。首次创建后，组件会深度监听 `data`；也可以通过 ref 方法进行更明确的局部更新。

## 基础字段

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mapJson` | `FeatureCollection` | — | 当前展示区域 GeoJSON，必填。 |
| `mapStroke` | `FeatureCollection` | — | 可选的流光轮廓 GeoJSON。 |
| `geoProjectionCenter` | `[number, number]` | `[108.887114, 35.263661]` | d3 Mercator 投影中心。 |
| `geoProjectionScale` | `number` | `85` | 投影缩放比例。 |
| `flyLineCenter` | `[number, number]` | 投影中心 | 飞线汇聚点。 |
| `rotateBorderSize` | `number` | `12` | 旋转边界直径基准。 |
| `bottomBgVisible` | `boolean` | `true` | 是否显示底部海洋背景。 |
| `cameraControls` | `object` | — | 透传至 Three.js `OrbitControls` 的属性。 |

坐标顺序始终是 `[longitude, latitude]`，也就是 `[经度, 纬度]`。

## 图层开关

| 字段 | 默认值 | 影响图层 |
| --- | --- | --- |
| `rotateBorderVisible` | `true` | 底部旋转边界 |
| `barVisible` | `true` | 区域柱图和数值标签 |
| `infoPointVisible` | `true` | 信息点与轮播标签 |
| `flyLineVisible` | `true` | 汇聚飞线与中心焦点 |
| `centerFlyLineVisible` | `true` | `flyLineVisible` 的可选别名 |
| `diffuseVisible` | `true` | 地图底部扩散光圈 |

## 区域柱图

```js
const provinces = [
  {
    name: '西安市',
    enName: "XI'AN",
    centroid: [108.797426, 34.10671],
    value: 100,
  },
]
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 区域名称。 |
| `enName` | 否 | 可选的英文名称。 |
| `centroid` | 是 | 柱图落点的经纬度。 |
| `value` | 是 | 高度、排序和标签数值。 |

## 信息点

```js
const infoPoints = [
  {
    name: '西安综合监测中心',
    lon: 108.797426,
    lat: 34.10671,
    value: 12,
    items: [
      { name: '设备在线', value: 48, unit: '台' },
      { name: '今日告警', value: 2, unit: '条' },
    ],
  },
]
```

`items` 存在时会作为弹层内容；否则组件使用 `name`、`value` 和 `unit` 生成默认内容。

## 标签

```js
{
  adminLabel: {
    visible: true,
    color: '#dceff0',
    scale: 0.016,
    height: 0.92,
    field: 'name',
  },
  labelScale: {
    map: 0.015,
    province: 0.01,
    infoPoint: 0.014,
  },
  mapFocusLabelInfo: {
    name: '陕西省',
    enName: 'SHAANXI PROVINCE',
    center: [108.887114, 31.45],
  },
}
```

行政区标签坐标优先读取 GeoJSON 的 `properties.centroid`，其次读取 `properties.center`，两者都没有时会根据几何坐标计算包围盒中心。

## 悬停抬升

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `mapHoverLiftEnabled` | `true` | 是否抬升悬停行政区。 |
| `mapHoverLiftHeight` | `0.18` | 抬升高度。 |
| `mapHoverLiftDuration` | `0.25` | 过渡时间，单位秒。 |

也可以使用 `mapHoverGrowEnabled`、`mapHoverGrowHeight` 和 `mapHoverGrowDuration` 配置相同效果。

## 颜色主题

`colors` 支持部分覆盖，未传值会保留内置主题。

```js
{
  colors: {
    sceneBackground: '#071827',
    provinceTopStart: '#168ba4',
    provinceTopEnd: '#0b526d',
    provinceSideStart: '#18465f',
    provinceSideEnd: '#0a2334',
    provinceHover: '#72e1e8',
    mapLine: '#c8f5f1',
    strokeLine: '#ffb566',
    rotateBorder: '#64dce7',
    flyLine: '#55b8c4',
    particle: '#80edf0',
    infoPointColors: ['#ffbd78', '#77e7e9'],
  },
}
```

完整颜色字段可在 `types/index.d.ts` 的 `MapColorOptions` 中查看。
