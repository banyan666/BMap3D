import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/BMapViewer-docs/',
    title: "BMapViewer",
    description: "vue3的离线地图",
    lang: 'zh-CN',
    // 添加 Vite 相关配置
    vite: {
        server: {
            port: 1234,        // 修改为你想要的端口
            host: '0.0.0.0',   // 允许外部访问（可选）
            strictPort: true,  // 如果端口被占用，直接退出而不是尝试下一个可用端口（可选）
            open: true         // 自动打开浏览器（可选）
        }
    },

    themeConfig: {
        // ... 你原有的 themeConfig 配置保持不变
        nav: [
            { text: '指南', link: '/introduction/index' },
        ],
        sidebar: [
            {
                items: [
                    {
                        text: '快速入门', items: [
                            { text: '介绍', link: '/introduction/index' },
                            { text: 'Hello World!', link: '/introduction/hello' },
                        ],
                        collapsed: false,
                    },
                    { text: '数据处理 Data', link: '/data' },
                    { text: '综合应用', link: '/examples' },
                    { text: '组件 BMapViewer', link: '/component/index' },
                    { text: 'useCesium', link: '/component/use-cesium' },
                    {
                        text: '可视化图层 MapLayers', items: [
                            { text: '底图图层 BaseMapLayer', link: '/layers/base-map' },
                            { text: '图标图层 IconGroupLayer', link: '/layers/icon-group' },
                            { text: '文字图层 LabelGroupLayer', link: '/layers/label-group' },
                            { text: '气泡图层 BubbleGroupLayer', link: '/layers/bubble-group' },
                            { text: '广告牌图层 BubbleLayer ', link: '/layers/bubble-dom' },
                            { text: '圆图层 CircleGroupLayer', link: '/layers/circle-group' },
                            { text: '圆爆炸图层 CircleExplosionLayer', link: '/layers/circle-explosion' },
                            { text: '水波纹图层 CircleWaveLayer', link: '/layers/circle-wave' },
                            { text: '点扩散图层 PointRippleLayer', link: '/layers/point-ripple' },
                            { text: '线图层 LineGroupLayer', link: '/layers/line-group' },
                            { text: '线图层 LinePrimitiveLayer', link: '/layers/line-primitive' },
                            { text: '线图层 LineMaterialLayer', link: '/layers/line-material' },
                            { text: '面图层 PolygonPrimitiveLayer', link: '/layers/polygon-primitive' },
                            { text: '3D白膜图层 Build3DLayer', link: '/layers/build-3d' },
                            { text: '热力图图层 HeatmapLayer', link: '/layers/heatmap' },
                            { text: '3D雷达 RadarScanner3dLayer', link: '/layers/radar-scanner-3d' },
                        ],
                        collapsed: false,
                    },
                    { text: '拾取工具 PickTools', link: '/tools/pick-tool' },
                    { text: '空间分析工具库 turf', link: '/tools/turf' },
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/banyan666/BMapViewer' },
            { icon: {
                svg:'<svg t="1775203934517" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2543" width="128" height="128"><path d="M512 0c282.784 0 512 229.216 512 512s-229.216 512-512 512S0 794.784 0 512 229.216 0 512 0z m189.952 752l11.2-108.224c-31.904 9.536-100.928 16.128-147.712 16.128-134.464 0-205.728-47.296-195.328-146.304 11.584-110.688 113.152-145.696 232.64-145.696 54.784 0 122.432 8.8 151.296 18.336L768 272.704C724.544 262.24 678.272 256 599.584 256c-203.2 0-388.704 94.88-406.4 263.488C178.336 660.96 303.584 768 535.616 768c80.672 0 138.464-6.432 166.336-16z" fill="#CE000D" p-id="2544"></path></svg>'},
                link: 'https://blog.csdn.net/A15029296293'
            }
        ],
        search: {
            provider: 'local'
        },
    },
})
