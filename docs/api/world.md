# Map3DWorld API

`Map3DWorld` 是组件内部的场景控制器。大多数业务应优先使用组件 ref；只有需要直接访问 Three.js 场景、相机或渲染器时才使用本 API。

## 直接创建

```js
import { Assets, Map3DWorld } from 'b-map3d'

const assets = new Assets()

assets.instance.on('onLoad', () => {
  const world = new Map3DWorld(canvas, assets, {
    mapJson,
    geoProjectionCenter: [108.887114, 35.263661],
    geoProjectionScale: 85,
  })

  world.time.resume()
})
```

直接创建时，调用者负责等待资源加载、管理 canvas，并在结束时执行 `world.destroy()` 和 `assets.instance.destroy()`。

## 常用属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `scene` | `THREE.Scene` | Three.js 场景。 |
| `camera.instance` | `THREE.Camera` | 当前透视相机。 |
| `camera.controls` | `OrbitControls` | 相机控制器。 |
| `renderer.instance` | `THREE.WebGLRenderer` | WebGL 渲染器。 |
| `time` | `Time` | requestAnimationFrame 时间管理。 |
| `animateTl` | `gsap.core.Timeline` | 初始入场时间线。 |

## 数据方法

```js
world.updateData(partialData, { reveal: true })
world.updateBarData(nextProvinces, { reveal: true })
world.updateInfoPointData(nextPoints, { reveal: true })
```

`reveal: false` 会跳过柱图和标签的重新入场动画，适合连续更新或需要自行编排动画的场景。

## 显隐方法

```js
world.setBarsVisible(true)
world.setInfoPointVisible(true)
world.setFlyLineVisible(true)
world.setDiffuseVisible(true)
world.setRotateBorderVisible(true)
```

## 相机控制

```js
world.setCameraControls({
  enablePan: false,
  minDistance: 20,
  maxDistance: 70,
  dampingFactor: 0.08,
})
```

传入的键必须存在于 `OrbitControls` 实例上；未知字段会被忽略。

## 销毁

```js
world.destroy()
```

销毁会停止 RAF、移除窗口尺寸监听、释放 OrbitControls、WebGLRenderer、几何体和材质，并清理 CSS3D 标签节点。方法可安全重复调用。
