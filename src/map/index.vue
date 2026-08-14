<template>
  <div class="b-map3d">
    <canvas ref="canvasRef" aria-label="交互式三维地图"></canvas>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from "vue"
import { Map3DWorld } from "./index.js"
import { Assets } from "./assets.js"

defineOptions({ name: "BMap3D" })

const props = defineProps({
  assets: {
    type: Object,
    default: null,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  autoLoad: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["ready", "progress", "error", "play-complete", "map-click"])

const canvasRef = shallowRef(null)
const world = shallowRef(null)
const localAssets = shallowRef(null)
const ready = shallowRef(false)

onMounted(async () => {
  await nextTick()
  if (props.assets) {
    load(props.assets)
    return
  }
  if (props.autoLoad) {
    loadDefaultAssets()
  }
})

onBeforeUnmount(() => {
  destroy()
})

watch(
    () => props.assets,
    (assets) => {
      if (assets && !world.value) load(assets)
    }
)

watch(
    () => props.data,
    (data) => {
      if (!world.value || !ready.value) return
      world.value.updateData(normalizeData(data), { reveal: true })
    },
    { deep: true }
)

function loadDefaultAssets() {
  localAssets.value = new Assets()
  localAssets.value.instance.on("onProgress", (path, loaded, total) => {
    emit("progress", {
      path,
      loaded,
      total,
      progress: total ? Math.floor((loaded / total) * 100) : 0,
    })
  })
  localAssets.value.instance.on("onError", (error) => {
    emit("error", error)
  })
  localAssets.value.instance.on("onLoad", () => {
    load(localAssets.value)
  })
}

function load(assets) {
  if (!canvasRef.value || world.value) return
  world.value = new Map3DWorld(canvasRef.value, assets, {
    ...normalizeData(props.data),
    onPlayComplete: () => emit("play-complete"),
    onMapClick: (data) => emit("map-click", data),
  })
  ready.value = true
  world.value.time.pause()
  if (props.autoplay) play()
  emit("ready", world.value)
}

function play() {
  if (!world.value) return
  world.value.time.resume()
  world.value.animateTl.timeScale(1)
  world.value.animateTl.play()
}

function pause() {
  world.value?.time.pause()
}

function updateData(data) {
  world.value?.updateData(normalizeData(data), { reveal: true })
}

function updateBars(provinces) {
  world.value?.updateBarData(provinces, { reveal: true })
}

function updateInfoPoints(infoPoints) {
  world.value?.updateInfoPointData(infoPoints, { reveal: true })
}

function setBarsVisible(visible = true) {
  world.value?.setBarsVisible(visible)
}

function setInfoPointVisible(visible = true) {
  world.value?.setInfoPointVisible(visible)
}

function setFlyLineVisible(visible = true) {
  world.value?.setFlyLineVisible(visible)
}

function setDiffuseVisible(visible = true) {
  world.value?.setDiffuseVisible(visible)
}

function setRotateBorderVisible(visible = true) {
  world.value?.setRotateBorderVisible(visible)
}

function destroy() {
  ready.value = false
  localAssets.value?.instance?.destroy?.()
  localAssets.value = null
  world.value?.destroy?.()
  world.value = null
}

function normalizeData(data = {}) {
  return {
    ...(data.mapJson ? { mapJson: data.mapJson } : {}),
    ...(data.mapStroke ? { mapStroke: data.mapStroke } : {}),
    ...(data.cameraControls ? { cameraControls: data.cameraControls } : {}),
    ...(data.colors ? { colors: data.colors } : {}),
    ...(data.adminLabel ? { adminLabel: data.adminLabel } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "adminLabelVisible")
      ? { adminLabelVisible: data.adminLabelVisible }
      : {}),
    ...(data.adminLabelColor ? { adminLabelColor: data.adminLabelColor } : {}),
    ...(data.adminLabelScale != null ? { adminLabelScale: data.adminLabelScale } : {}),
    ...(data.adminLabelHeight != null ? { adminLabelHeight: data.adminLabelHeight } : {}),
    ...(data.adminLabelField ? { adminLabelField: data.adminLabelField } : {}),
    ...(data.geoProjectionCenter ? { geoProjectionCenter: data.geoProjectionCenter } : {}),
    ...(data.geoProjectionScale ? { geoProjectionScale: data.geoProjectionScale } : {}),
    ...(data.flyLineCenter ? { flyLineCenter: data.flyLineCenter } : {}),
    ...(data.rotateBorderSize != null ? { rotateBorderSize: data.rotateBorderSize } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "bottomBgVisible")
      ? { bottomBgVisible: data.bottomBgVisible }
      : {}),
    ...(data.labelScale ? { labelScale: data.labelScale } : {}),
    ...(data.mapLabelScale != null ? { mapLabelScale: data.mapLabelScale } : {}),
    ...(data.provinceLabelScale != null ? { provinceLabelScale: data.provinceLabelScale } : {}),
    ...(data.infoPointLabelScale != null ? { infoPointLabelScale: data.infoPointLabelScale } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "rotateBorderVisible")
      ? { rotateBorderVisible: data.rotateBorderVisible }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "barVisible") ? { barVisible: data.barVisible } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "infoPointVisible")
      ? { infoPointVisible: data.infoPointVisible }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "flyLineVisible") ? { flyLineVisible: data.flyLineVisible } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "centerFlyLineVisible")
      ? { centerFlyLineVisible: data.centerFlyLineVisible }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "diffuseVisible") ? { diffuseVisible: data.diffuseVisible } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "mapHoverGrowEnabled")
      ? { mapHoverGrowEnabled: data.mapHoverGrowEnabled }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "hoverGrowEnabled")
      ? { hoverGrowEnabled: data.hoverGrowEnabled }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "mapHoverLiftEnabled")
      ? { mapHoverLiftEnabled: data.mapHoverLiftEnabled }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "hoverLiftEnabled")
      ? { hoverLiftEnabled: data.hoverLiftEnabled }
      : {}),
    ...(data.mapHoverGrowHeight != null ? { mapHoverGrowHeight: data.mapHoverGrowHeight } : {}),
    ...(data.hoverGrowHeight != null ? { hoverGrowHeight: data.hoverGrowHeight } : {}),
    ...(data.mapHoverLiftHeight != null ? { mapHoverLiftHeight: data.mapHoverLiftHeight } : {}),
    ...(data.hoverLiftHeight != null ? { hoverLiftHeight: data.hoverLiftHeight } : {}),
    ...(data.mapHoverGrowDuration != null ? { mapHoverGrowDuration: data.mapHoverGrowDuration } : {}),
    ...(data.hoverGrowDuration != null ? { hoverGrowDuration: data.hoverGrowDuration } : {}),
    ...(data.mapHoverLiftDuration != null ? { mapHoverLiftDuration: data.mapHoverLiftDuration } : {}),
    ...(data.hoverLiftDuration != null ? { hoverLiftDuration: data.hoverLiftDuration } : {}),
    ...(data.chinaLabels ? { chinaLabels: data.chinaLabels } : {}),
    ...(data.provinces ? { provinces: data.provinces } : {}),
    ...(data.scatter ? { scatter: data.scatter } : {}),
    ...(Object.prototype.hasOwnProperty.call(data, "infoPoints") ? { infoPoints: data.infoPoints } : {}),
    ...(data.mapFocusLabelInfo ? { mapFocusLabelInfo: data.mapFocusLabelInfo } : {}),
  }
}

defineExpose({
  load,
  play,
  pause,
  updateData,
  updateBars,
  updateInfoPoints,
  setBarsVisible,
  setInfoPointVisible,
  setFlyLineVisible,
  setDiffuseVisible,
  setRotateBorderVisible,
  destroy,
  world,
})
</script>

<style lang="less">
.b-map3d {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;

  canvas {
    display: block;
  }

  .info-point {
    width: 190px;
    min-height: 70px;
    padding: 16px 12px 10px;
    margin-bottom: 30px;
    color: #a3dcde;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    will-change: transform;
  }

  .info-point-wrap {
    &:after,
    &:before {
      position: absolute;
      top: 0;
      display: block;
      width: 15px;
      height: 15px;
      border-top: 1px solid #4b87a6;
      content: "";
    }

    &:before {
      left: 0;
      border-left: 1px solid #4b87a6;
    }

    &:after {
      right: 0;
      border-right: 1px solid #4b87a6;
    }
  }

  .info-point-wrap-inner {
    &:after,
    &:before {
      position: absolute;
      bottom: 0;
      display: block;
      width: 15px;
      height: 15px;
      border-bottom: 1px solid #4b87a6;
      content: "";
    }

    &:before {
      left: 0;
      border-left: 1px solid #4b87a6;
    }

    &:after {
      right: 0;
      border-right: 1px solid #4b87a6;
    }
  }

  .info-point-line {
    position: absolute;
    top: 7px;
    right: 12px;
    display: flex;

    .line {
      width: 5px;
      height: 2px;
      margin-right: 5px;
      background: #17e5c3;
    }
  }

  .info-point-content {
    .content-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 28px;
      margin-bottom: 5px;
      line-height: 28px;
      background: rgba(35, 47, 58, 0.6);
    }

    .label {
      flex: 0 0 70px;
      padding-left: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value {
      color: #fff;
      flex: 1;
      min-width: 0;
      padding-right: 10px;
      overflow: hidden;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .provinces-label-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    min-width: 150px;
    max-width: 260px;
    height: 53px;
    padding: 0 18px;
    border-radius: 30px 30px 30px 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transform: translate(50%, 200%);
  }

  .provinces-label {
    .number {
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      white-space: nowrap;
    }

    .name {
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      span {
        display: block;
      }
    }

    .en {
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      opacity: 0.5;
    }

    .value {
      color: #7efbf6;
      text-shadow: 0 0 5px #7efbf6, 0 0 10px #7efbf6;
    }

    .yellow .value {
      color: #fef99e !important;
      text-shadow: 0 0 5px #fef99e, 0 0 10px #fef99e !important;
    }
  }

  .china-label {
    color: #fff;
    font-size: 12px;
    will-change: transform;

    &.blur {
      opacity: 0.5;
      filter: blur(2px);
    }

    .label-icon {
      display: block;
      width: 20px;
      height: 20px;
      margin: 0 10px 0 0;
    }
  }

  .map-label {
    padding: 5px;
    color: #fff;
    font-size: 36px;
    font-weight: bold;
    letter-spacing: 4.5px;
    -webkit-box-reflect: below 0 -webkit-linear-gradient(transparent, transparent 20%, rgba(255, 255, 255, 0.3));

    .other-label {
      display: flex;
      flex-direction: column;
    }

    span {
      font-size: 46px;

      &:last-child {
        color: #a7d5ef;
        font-size: 12px;
        font-weight: normal;
        letter-spacing: 0;
      }
    }
  }

  .admin-region-label {
    pointer-events: none;
    will-change: transform;
  }

  .admin-region-label-text {
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    text-align: center;
    opacity: 0;
    transform: translateY(12px);
    will-change: transform, opacity;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.75), 0 0 10px rgba(126, 251, 246, 0.45);
  }

  .decoration-label .label-icon {
    display: block;
    width: 40px;
    height: 40px;
  }

  .other-label {
    background: none;
    opacity: 0;
    transform: translateY(200%);
    will-change: transform;
  }

  .china-label .other-label {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.6);
    will-change: transform;
  }
}
</style>
