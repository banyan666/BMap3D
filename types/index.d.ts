import type { DefineComponent, Plugin, ShallowRef } from 'vue'
import type { Camera, Scene, WebGLRenderer } from 'three'

export type Coordinate = [longitude: number, latitude: number]

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: Array<Record<string, unknown>>
  [key: string]: unknown
}

export interface ProvinceDatum {
  name: string
  enName?: string
  centroid: Coordinate
  value: number
  [key: string]: unknown
}

export interface InfoPointItem {
  name: string
  value: string | number
  unit?: string
}

export interface InfoPointDatum {
  name?: string
  lon: number
  lat: number
  value?: number
  unit?: string
  items?: InfoPointItem[]
  [key: string]: unknown
}

export interface MapColorOptions {
  sceneBackground?: string
  pointLight?: string
  chinaBackground?: string
  chinaLine?: string
  chinaBlurLine?: string
  provinceTopStart?: string
  provinceTopEnd?: string
  provinceExtrudeTopStart?: string
  provinceExtrudeTopEnd?: string
  provinceSideStart?: string
  provinceSideEnd?: string
  provinceHover?: string
  mapLine?: string
  strokeLine?: string
  barPrimaryStart?: string
  barPrimaryEnd?: string
  barSecondaryStart?: string
  barSecondaryEnd?: string
  barPrimaryGlow?: string
  barSecondaryGlow?: string
  barCircle?: string
  diffuseBase?: string
  diffuse?: string
  gridLine?: string
  gridShape?: string
  gridPoint?: string
  rotateBorder?: string
  flyLine?: string
  flyLineFocusStart?: string
  flyLineFocusEnd?: string
  particle?: string
  infoPointColors?: string[]
}

export interface AdminLabelOptions {
  visible?: boolean
  color?: string
  scale?: number
  height?: number
  field?: string
}

export interface LabelScaleOptions {
  map?: number
  province?: number
  infoPoint?: number
}

export interface MapFocusLabelInfo {
  name: string
  enName?: string
  center: Coordinate
}

export interface BMap3DData {
  mapJson?: GeoJsonFeatureCollection
  mapStroke?: GeoJsonFeatureCollection
  geoProjectionCenter?: Coordinate
  geoProjectionScale?: number
  flyLineCenter?: Coordinate
  cameraControls?: Record<string, unknown>
  colors?: MapColorOptions
  adminLabel?: AdminLabelOptions
  adminLabelVisible?: boolean
  adminLabelColor?: string
  adminLabelScale?: number
  adminLabelHeight?: number
  adminLabelField?: string
  labelScale?: LabelScaleOptions
  mapLabelScale?: number
  provinceLabelScale?: number
  infoPointLabelScale?: number
  rotateBorderSize?: number
  bottomBgVisible?: boolean
  rotateBorderVisible?: boolean
  barVisible?: boolean
  infoPointVisible?: boolean
  flyLineVisible?: boolean
  centerFlyLineVisible?: boolean
  diffuseVisible?: boolean
  mapHoverLiftEnabled?: boolean
  mapHoverLiftHeight?: number
  mapHoverLiftDuration?: number
  provinces?: ProvinceDatum[]
  infoPoints?: InfoPointDatum[]
  mapFocusLabelInfo?: MapFocusLabelInfo
}

export interface LoadProgress {
  path: string
  loaded: number
  total: number
  progress: number
}

export interface ResourceManager {
  on(event: string, handler: (...args: unknown[]) => void): void
  getResource(name: string): unknown
  loadAll(items: Array<Record<string, unknown>>): Promise<unknown[]>
  destroy(): void
}

export class Assets {
  instance: ResourceManager
  constructor()
}

export class Map3DWorld {
  scene: Scene
  camera: { instance: Camera; controls: Record<string, unknown> }
  renderer: { instance: WebGLRenderer }
  time: {
    pause(): void
    resume(): void
    isActive(): boolean
  }
  animateTl: { play(): void; pause(): void; timeScale(value: number): unknown }
  constructor(canvas: HTMLCanvasElement, assets: Assets, options?: BMap3DData)
  updateData(data: Partial<BMap3DData>, options?: { reveal?: boolean }): void
  updateBarData(provinces: ProvinceDatum[], options?: { reveal?: boolean }): void
  updateInfoPointData(infoPoints: InfoPointDatum[], options?: { reveal?: boolean }): void
  setBarsVisible(visible?: boolean): void
  setInfoPointVisible(visible?: boolean): void
  setFlyLineVisible(visible?: boolean): void
  setDiffuseVisible(visible?: boolean): void
  setRotateBorderVisible(visible?: boolean): void
  destroy(): void
}

export { Map3DWorld as World }

export interface BMap3DExpose {
  load(assets: Assets): void
  play(): void
  pause(): void
  updateData(data: Partial<BMap3DData>): void
  updateBars(provinces: ProvinceDatum[]): void
  updateInfoPoints(infoPoints: InfoPointDatum[]): void
  setBarsVisible(visible?: boolean): void
  setInfoPointVisible(visible?: boolean): void
  setFlyLineVisible(visible?: boolean): void
  setDiffuseVisible(visible?: boolean): void
  setRotateBorderVisible(visible?: boolean): void
  destroy(): void
  world: ShallowRef<Map3DWorld | null>
}

export const BMap3D: DefineComponent<{
  assets?: Assets | null
  data?: BMap3DData
  autoLoad?: boolean
  autoplay?: boolean
}> & { install: Plugin['install'] }

declare const plugin: Plugin
export default plugin
