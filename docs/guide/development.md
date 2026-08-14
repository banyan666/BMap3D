# 开发与构建

## 项目结构

```text
src/
├─ index.js            包入口与 Vue 插件
├─ map/
│  ├─ index.vue        BMap3D 组件
│  ├─ index.js         Map3DWorld 场景
│  └─ assets.js        内置资源清单
├─ mini3d/             渲染、相机、时间轴、图元与着色器
├─ json/               全国 GeoJSON
└─ texture/            场景纹理
```

## 开发命令

```bash
pnpm dev
```

根目录 `index.html` 会加载 `example/App.vue`，示例直接引用 `src/index.js`，源码修改可以热更新。

## 组件库构建

```bash
pnpm build
```

Vite Library Mode 生成：

| 文件 | 说明 |
| --- | --- |
| `dist/BMap3D.js` | ES Module 构建 |
| `dist/BMap3D.umd.cjs` | UMD 构建 |
| `dist/style.css` | 组件样式 |

Vue 被标记为 external，由使用方提供；Three.js、GSAP、d3-geo 和默认资源会打入组件产物，使构建结果可独立交付。

## 示例与文档构建

```bash
pnpm build:example
pnpm docs:build
```

输出目录分别为 `example-dist/` 和 `docs/.vitepress/dist/`。

## 完整校验

```bash
pnpm check
```

该命令依次执行 Vue 类型检查、组件库构建、示例构建和 VitePress 静态构建。提交前应确保全部通过。
