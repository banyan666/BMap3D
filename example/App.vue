<template>
  <div class="console-shell">
    <header class="topbar">
      <a class="brand" href="#viewport" aria-label="BMap3D 演示首页">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>
          <strong>BMap3D</strong>
          <small>Spatial runtime / Vue 3</small>
        </span>
      </a>

      <div class="topbar-tools">
        <a class="docs-link" :href="docsUrl">
          <span>DOCS / API</span>
          组件文档
          <i aria-hidden="true">↗</i>
        </a>
        <div class="topbar-status" aria-live="polite">
          <span class="pulse-dot" :class="{ pending: !ready }"></span>
          {{ ready ? '场景在线' : `资源同步 ${progress}%` }}
        </div>
      </div>
    </header>

    <main class="workspace">
      <aside class="control-rail" aria-label="地图控制台">
        <section class="rail-intro">
          <p class="eyebrow">中国 · 陕西 / 35.26°N</p>
          <h1>城市空间<br /><em>运行态势</em></h1>
          <p class="lede">拖拽旋转，滚轮缩放，点击行政区查看地图交互事件。</p>
        </section>

        <section class="rail-section">
          <div class="section-heading">
            <span>图层编排</span>
            <small>{{ visibleLayerCount }}/5 ACTIVE</small>
          </div>
          <button
            v-for="layer in layerOptions"
            :key="layer.key"
            class="layer-switch"
            :class="{ active: layers[layer.key] }"
            type="button"
            :aria-pressed="layers[layer.key]"
            @click="toggleLayer(layer)"
          >
            <span class="layer-index">{{ layer.code }}</span>
            <span>{{ layer.label }}</span>
            <span class="switch-track"><i></i></span>
          </button>
        </section>

        <section class="rail-section signal-section">
          <div class="section-heading">
            <span>区域信号</span>
            <small>LIVE SAMPLE</small>
          </div>
          <div class="signal-row" v-for="item in ranking" :key="item.name">
            <span>{{ item.name }}</span>
            <i><b :style="{ width: `${item.value}%` }"></b></i>
            <strong>{{ item.value }}</strong>
          </div>
        </section>
      </aside>

      <section
        id="viewport"
        class="map-viewport"
        :class="{ 'editor-visible': editorOpen }"
        aria-label="三维地图演示区"
      >
        <BMap3D
          :key="sceneKey"
          ref="mapRef"
          :data="mapData"
          :autoplay="true"
          @progress="handleProgress"
          @ready="handleReady"
          @error="handleError"
          @map-click="handleMapClick"
        />

        <div class="survey-grid" aria-hidden="true"></div>
        <div class="viewport-label north-label" aria-hidden="true">N ↑</div>
        <div class="viewport-label scale-label" aria-hidden="true">20 KM ├────────┤</div>

        <div class="map-meta">
          <span>SCENE / SHAANXI</span>
          <strong>{{ selectedRegion || '全域总览' }}</strong>
          <small>{{ selectedRegion ? '已捕获 map-click 事件' : '选择一个行政区查看返回数据' }}</small>
        </div>

        <div class="map-actions" aria-label="场景操作">
          <button type="button" @click="togglePlayback">
            <span aria-hidden="true">{{ playing ? 'Ⅱ' : '▶' }}</span>
            {{ playing ? '暂停渲染' : '继续渲染' }}
          </button>
          <button type="button" @click="refreshValues">
            <span aria-hidden="true">↻</span>
            刷新样本
          </button>
          <button
            type="button"
            :aria-expanded="editorOpen"
            aria-controls="parameter-editor"
            @click="editorOpen = !editorOpen"
          >
            <span aria-hidden="true">{ }</span>
            {{ editorOpen ? '收起参数' : '编辑参数' }}
          </button>
        </div>

        <Transition name="editor-drawer">
          <aside
            v-if="editorOpen"
            id="parameter-editor"
            class="code-panel"
            aria-label="地图参数编辑器"
          >
            <header class="code-panel-header">
              <div>
                <span>PARAMETER LAB / JSON</span>
                <strong>实时地图参数</strong>
              </div>
              <button type="button" aria-label="关闭参数编辑器" @click="editorOpen = false">×</button>
            </header>

            <div class="code-panel-note">
              修改配置后应用到当前场景。GeoJSON 保持使用陕西省数据。
              <kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd> 快速应用
            </div>

            <div class="code-editor-wrap">
              <JsonCodeEditor v-model="editorCode" @submit="applyEditorConfig" />
            </div>

            <footer class="code-panel-footer">
              <div class="editor-feedback" :class="editorFeedback.type" aria-live="polite">
                <i></i>
                <span>{{ editorFeedback.message }}</span>
              </div>
              <div class="editor-buttons">
                <button type="button" @click="formatEditorCode">格式化</button>
                <button type="button" @click="resetEditorCode">恢复默认</button>
                <button class="apply-button" type="button" :disabled="!ready" @click="applyEditorConfig">
                  应用到地图
                </button>
              </div>
            </footer>
          </aside>
        </Transition>

        <div v-if="!ready" class="loading-panel" role="status">
          <span>INITIALIZING SPATIAL RUNTIME</span>
          <strong>{{ String(progress).padStart(2, '0') }}%</strong>
          <i><b :style="{ width: `${progress}%` }"></b></i>
        </div>

        <div v-if="errorMessage" class="error-panel" role="alert">
          资源加载失败：{{ errorMessage }}
        </div>
      </section>
    </main>

    <footer class="statusbar">
      <span>WEBGL / {{ ready ? 'READY' : 'LOADING' }}</span>
      <span>PROJECTION / MERCATOR</span>
      <span class="statusbar-hint">BMap3D 三维地图组件演示</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { BMap3D } from '../src/index.js'
import { createMapData, provinceData } from './data/map-data.js'
import JsonCodeEditor from './components/JsonCodeEditor.vue'

const mapRef = ref(null)
const docsUrl = `${import.meta.env.BASE_URL}docs/`
const ready = ref(false)
const playing = ref(true)
const progress = ref(0)
const errorMessage = ref('')
const selectedRegion = ref('')
const editorOpen = ref(false)
const sceneKey = ref(0)
const mapData = createMapData()
const ranking = ref(provinceData.slice(0, 4).map((item) => ({ ...item })))
const defaultEditorCode = serializeEditableConfig(mapData)
const editorCode = ref(defaultEditorCode)
let appliedEditorConfig = JSON.parse(defaultEditorCode)
const editorFeedback = reactive({
  type: 'idle',
  message: '等待修改',
})

const layers = reactive({
  bars: true,
  infoPoints: true,
  flyLines: true,
  diffuse: true,
  rotateBorder: true,
})

const layerOptions = [
  { key: 'bars', code: 'A1', label: '区域柱图', method: 'setBarsVisible' },
  { key: 'infoPoints', code: 'A2', label: '监测信息点', method: 'setInfoPointVisible' },
  { key: 'flyLines', code: 'A3', label: '中心飞线', method: 'setFlyLineVisible' },
  { key: 'diffuse', code: 'A4', label: '扩散光圈', method: 'setDiffuseVisible' },
  { key: 'rotateBorder', code: 'A5', label: '旋转边界', method: 'setRotateBorderVisible' },
]

const visibleLayerCount = computed(() => Object.values(layers).filter(Boolean).length)

function handleProgress(info) {
  progress.value = info.progress
}

function handleReady() {
  progress.value = 100
  ready.value = true
}

function handleError(error) {
  errorMessage.value = error?.message || String(error)
}

function handleMapClick(data) {
  selectedRegion.value = data?.name || data?.adcode || '未知区域'
}

function toggleLayer(layer) {
  layers[layer.key] = !layers[layer.key]
  mapRef.value?.[layer.method]?.(layers[layer.key])
}

function togglePlayback() {
  playing.value = !playing.value
  mapRef.value?.[playing.value ? 'play' : 'pause']?.()
}

function refreshValues() {
  const next = provinceData.map((item) => ({
    ...item,
    value: Math.max(18, Math.min(100, item.value + Math.round(Math.random() * 28 - 14))),
  }))
  ranking.value = [...next].sort((a, b) => b.value - a.value).slice(0, 4)
  mapRef.value?.updateBars(next)
}

function serializeEditableConfig(data) {
  const { mapJson, mapStroke, ...editableConfig } = data
  return JSON.stringify(editableConfig, null, 2)
}

function parseEditorConfig() {
  const parsed = JSON.parse(editorCode.value)
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('JSON 根节点必须是对象')
  }
  return parsed
}

function getChangedConfig(nextConfig) {
  return Object.fromEntries(
    Object.entries(nextConfig).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(appliedEditorConfig[key]),
    ),
  )
}

function formatEditorCode() {
  try {
    editorCode.value = JSON.stringify(parseEditorConfig(), null, 2)
    editorFeedback.type = 'idle'
    editorFeedback.message = '格式已整理'
  } catch (error) {
    editorFeedback.type = 'error'
    editorFeedback.message = `无法格式化：${error.message}`
  }
}

function resetEditorCode() {
  editorCode.value = defaultEditorCode
  applyEditorConfig()
}

function applyEditorConfig() {
  try {
    if (!ready.value) {
      throw new Error('场景初始化完成后才能应用参数')
    }

    const nextConfig = parseEditorConfig()
    const changedConfig = getChangedConfig(nextConfig)

    if (Object.keys(changedConfig).length === 0) {
      editorFeedback.type = 'idle'
      editorFeedback.message = '参数没有变化'
      return
    }

    Object.assign(mapData, nextConfig)
    appliedEditorConfig = JSON.parse(JSON.stringify(nextConfig))

    ready.value = false
    progress.value = 0
    errorMessage.value = ''
    selectedRegion.value = ''
    playing.value = true
    sceneKey.value += 1

    const layerBindings = {
      barVisible: 'bars',
      infoPointVisible: 'infoPoints',
      flyLineVisible: 'flyLines',
      diffuseVisible: 'diffuse',
      rotateBorderVisible: 'rotateBorder',
    }
    Object.entries(layerBindings).forEach(([configKey, layerKey]) => {
      if (Object.prototype.hasOwnProperty.call(changedConfig, configKey)) {
        layers[layerKey] = changedConfig[configKey] !== false
      }
    })

    if (Array.isArray(nextConfig.provinces)) {
      ranking.value = [...nextConfig.provinces]
        .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
        .slice(0, 4)
    }

    editorFeedback.type = 'success'
    editorFeedback.message = `已应用 · ${new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`
  } catch (error) {
    editorFeedback.type = 'error'
    editorFeedback.message = `参数未应用：${error.message}`
  }
}

onBeforeUnmount(() => mapRef.value?.destroy())
</script>
