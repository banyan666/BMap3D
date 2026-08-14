import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'BMap3D',
  description: 'Vue 3 交互式 3D 行政区地图组件',
  base: process.env.DOCS_BASE || '/',
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0a1927' }],
    ['link', { rel: 'icon', href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><rect width=%2264%22 height=%2264%22 rx=%2212%22 fill=%22%230a1927%22/><path d=%22M12 39 32 13l20 26-20 12z%22 fill=%22none%22 stroke=%22%2364dce7%22 stroke-width=%224%22/><circle cx=%2232%22 cy=%2232%22 r=%225%22 fill=%22%23ffb566%22/></svg>" }],
  ],
  themeConfig: {
    siteTitle: 'BMap3D',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '示例', link: '/examples/' },
      { text: 'API', link: '/api/component' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '数据与配置', link: '/guide/data' },
          { text: '自定义资源', link: '/guide/assets' },
          { text: '开发与构建', link: '/guide/development' },
        ],
      },
      {
        text: '示例',
        items: [
          { text: '完整交互示例', link: '/examples/' },
          { text: '动态更新', link: '/examples/dynamic' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'BMap3D 组件', link: '/api/component' },
          { text: 'Map3DWorld', link: '/api/world' },
        ],
      },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    footer: {
      message: 'BMap3D · Vue 3 spatial component',
      copyright: 'Built with VitePress',
    },
  },
  lastUpdated: true,
})
