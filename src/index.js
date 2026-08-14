import BMap3D from './map/index.vue'
import { Assets } from './map/assets.js'
import { Map3DWorld, World } from './map/index.js'

const install = (app) => {
  app.component('BMap3D', BMap3D)
}

BMap3D.install = install

export { BMap3D, Assets, Map3DWorld, World }
export * from './mini3d/index.js'

export default {
  install,
}
