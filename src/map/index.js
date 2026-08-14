import {
  Fog,
  Group,
  MeshBasicMaterial,
  DirectionalLight,
  AmbientLight,
  PointLight,
  Vector3,
  MeshLambertMaterial,
  LineBasicMaterial,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
  NearestFilter,
  BoxGeometry,
  TubeGeometry,
  QuadraticBezierCurve3,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  CustomBlending,
  AddEquation,
  DstColorFactor,
  OneFactor,
} from "three"
import {
  Mini3d,
  ExtrudeMap,
  BaseMap,
  Line,
  Grid,
  Label3d,
  Plane,
  Particles,
  GradientShader,
  DiffuseShader,
  Focus,
} from "../mini3d/index.js"

import { geoMercator } from "d3-geo"
import gsap from "gsap"
import { InteractionManager } from "three.interactive"
function sortByValue(data) {
  data.sort((a, b) => b.value - a.value)
  return data
}

function normalizeLabelScale(options = {}, defaults = {}) {
  const labelScale = options.labelScale || {}
  return {
    map: options.mapLabelScale ?? labelScale.map ?? defaults.map ?? 0.015,
    province: options.provinceLabelScale ?? labelScale.province ?? defaults.province ?? 0.01,
    infoPoint: options.infoPointLabelScale ?? labelScale.infoPoint ?? defaults.infoPoint ?? 0.015,
  }
}

function normalizeAdminLabel(options = {}, defaults = {}) {
  const adminLabel = options.adminLabel || {}
  return {
    visible: options.adminLabelVisible ?? adminLabel.visible ?? defaults.visible ?? true,
    color: options.adminLabelColor ?? adminLabel.color ?? defaults.color ?? "#ffffff",
    scale: options.adminLabelScale ?? adminLabel.scale ?? defaults.scale ?? 0.01,
    height: options.adminLabelHeight ?? adminLabel.height ?? defaults.height ?? 0.85,
    field: options.adminLabelField ?? adminLabel.field ?? defaults.field ?? "name",
  }
}

const DEFAULT_MAP_COLORS = {
  sceneBackground: "#102736",
  pointLight: "#1d5e5e",
  chinaBackground: "#152c47",
  chinaLine: "#3f82cd",
  chinaBlurLine: "#3f82cd",
  provinceTopStart: "#12bbe0",
  provinceTopEnd: "#0094b5",
  provinceExtrudeTopStart: "#2a6e92",
  provinceExtrudeTopEnd: "#102736",
  provinceSideStart: "#2a6e92",
  provinceSideEnd: "#2a6e92",
  provinceHover: "rgba(115,208,255,1)",
  mapLine: "#ffffff",
  strokeLine: "#2bc4dc",
  barPrimaryStart: "#50bbfe",
  barPrimaryEnd: "#77fbf5",
  barSecondaryStart: "#fbdf88",
  barSecondaryEnd: "#fffef4",
  barPrimaryGlow: "#77fbf5",
  barSecondaryGlow: "#fffef4",
  barCircle: "#ffffff",
  diffuseBase: "#000000",
  diffuse: "#71918e",
  gridLine: "#1b4b70",
  gridShape: "#2a5f8a",
  gridPoint: "#154d7d",
  rotateBorder: "#48afff",
  flyLine: "#2a6f72",
  flyLineFocusStart: "#bdfdfd",
  flyLineFocusEnd: "#bdfdfd",
  particle: "#00eeee",
  infoPointColors: ["#fffef4", "#77fbf5"],
}

function normalizeMapColors(options = {}, defaults = DEFAULT_MAP_COLORS) {
  const colors = options.colors || {}
  return {
    ...DEFAULT_MAP_COLORS,
    ...defaults,
    ...colors,
    infoPointColors: colors.infoPointColors || defaults.infoPointColors || DEFAULT_MAP_COLORS.infoPointColors,
  }
}

export class Map3DWorld extends Mini3d {
  constructor(canvas, assets, options = {}) {
    super(canvas)
    // 中心坐标
    this.geoProjectionCenter = options.geoProjectionCenter || [108.887114, 35.263661]
    // 缩放比例
    this.geoProjectionScale = options.geoProjectionScale || 85
    // 飞线中心
    this.flyLineCenter = options.flyLineCenter || options.geoProjectionCenter || [108.948024, 34.263161]
    // 地图拉伸高度
    this.depth = 0.5
    this.rotateBorderSize = options.rotateBorderSize ?? 12
    this.bottomBgVisible = options.bottomBgVisible !== false
    this.rotateBorderVisible = options.rotateBorderVisible !== false
    this.barVisible = options.barVisible !== false
    this.infoPointVisible = options.infoPointVisible !== false
    this.flyLineVisible = options.flyLineVisible !== false && options.centerFlyLineVisible !== false
    this.diffuseVisible = options.diffuseVisible !== false
    this.labelScale = normalizeLabelScale(options)
    this.adminLabel = normalizeAdminLabel(options)
    this.colors = normalizeMapColors(options)
    this.mapFocusLabelInfo = {
      name: "陕西省",
      enName: "SHAANXI PROVINCE",
      center: [108.887114, 31.45],
    }
    // 是否点击
    this.clicked = false
    this.mapClickMoveThreshold = options.mapClickMoveThreshold ?? 5
    this.mapClickState = null
    this.mapHoverGrowEnabled =
      options.mapHoverLiftEnabled ?? options.hoverLiftEnabled ?? options.mapHoverGrowEnabled ?? options.hoverGrowEnabled ?? true
    this.mapHoverGrowHeight =
      options.mapHoverGrowHeight ?? options.hoverGrowHeight ?? options.mapHoverLiftHeight ?? options.hoverLiftHeight ?? 0.18
    this.mapHoverGrowDuration =
      options.mapHoverGrowDuration ?? options.hoverGrowDuration ?? options.mapHoverLiftDuration ?? options.hoverLiftDuration ?? 0.25
    // 雾
    this.scene.fog = new Fog(0x102736, 1, 50)
    // 背景
    this.scene.background = new Color(this.colors.sceneBackground)

    // 相机初始位置
    this.camera.instance.position.set(-13.767695123014105, 12.990152163077308, 39.28228164159694)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()
    this.setCameraControls(options.cameraControls)
    // 创建交互管理
    this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)

    this.assets = assets
    this.options = options
    if (options.mapFocusLabelInfo) {
      this.mapFocusLabelInfo = {
        ...this.mapFocusLabelInfo,
        ...options.mapFocusLabelInfo,
      }
    }
    this.mapData = {
      mapJson: options.mapJson,
      mapStroke: options.mapStroke,
      cameraControls: options.cameraControls,
      bottomBgVisible: this.bottomBgVisible,
      rotateBorderSize: this.rotateBorderSize,
      rotateBorderVisible: this.rotateBorderVisible,
      barVisible: this.barVisible,
      infoPointVisible: this.infoPointVisible,
      flyLineVisible: this.flyLineVisible,
      diffuseVisible: this.diffuseVisible,
      labelScale: this.labelScale,
      adminLabel: this.adminLabel,
      colors: this.colors,
      provinces: options.provinces || [],
      infoPoints: Array.isArray(options.infoPoints) ? options.infoPoints : [],
      mapFocusLabelInfo: this.mapFocusLabelInfo,
    }
    // 创建环境光
    this.initEnvironment()
    this.init()
  }
  setCameraControls(cameraControls = {}) {
    const controls = this.camera?.controls
    if (!controls) return
    const config = {
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2 - 0.05,
      ...cameraControls,
    }
    Object.keys(config).forEach((key) => {
      if (config[key] != null && key in controls) {
        controls[key] = config[key]
      }
    })
    controls.update()
  }
  init() {
    // 标签组
    this.labelGroup = new Group()
    this.label3d = new Label3d(this)
    this.labelGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.labelGroup)
    // 飞线焦点光圈组
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.flyLineFocusGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.flyLineFocusGroup)
    // 区域事件元素
    this.eventElement = []
    this.mapHoverRegions = []
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    this.quanTicks = []
    this.barAnimateTl = null
    // 鼠标移上移除的材质
    this.defaultMaterial = null // 默认材质
    this.defaultLightMaterial = null // 高亮材质
    // 创建底部高亮
    if (this.bottomBgVisible) this.createBottomBg()
    // 模糊边线
    this.createChinaBlurLine()

    // 扩散网格
    this.createGrid()
    // 旋转圆环
    this.createRotateBorder()
    // 创建标签
    this.createLabel()
    // 创建地图
    this.createMap()
    if (this.hasProvinceData()) this.createBar()
    // 添加事件
    this.createEvent()
    // 创建飞线
    this.createFlyLine()
    // 创建飞线焦点
    this.createFocus()
    // 创建粒子
    this.createParticles()
    // 创建信息点
    if (this.hasInfoPointData()) this.createInfoPoint()
    // 创建轮廓
    this.createStorke()
    // this.time.on("tick", () => {
    //   console.log(this.camera.instance.position);
    // });
    // 创建动画时间线
    let tl = gsap.timeline({
      onComplete: () => {},
    })
    tl.pause()
    this.animateTl = tl
    tl.addLabel("focusMap", 1.5)
    tl.addLabel("focusMapOpacity", 2)
    tl.addLabel("adminLabel", 2.5)
    tl.addLabel("bar", 3)
    tl.to(this.camera.instance.position, {
      duration: 2,
      x: -0.17427287762525134,
      y: 13.678992786206543,
      z: 20.688611202093714,
      ease: "circ.out",
      onStart: () => {
        this.flyLineFocusGroup.visible = false
      },
    })
    tl.to(
      this.focusMapGroup.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      },
      "focusMap"
    )

    tl.to(
      this.focusMapGroup.scale,
      {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.setFlyLineVisible(this.flyLineVisible)
          if (this.InfoPointGroup && this.infoPointVisible) {
            this.setInfoPointVisible(true)
          }
        },
      },
      "focusMap"
    )

    tl.to(
      this.focusMapTopMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.focusMapSideMaterial,
      {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
        onComplete: () => {
          this.focusMapSideMaterial.transparent = false
        },
      },
      "focusMapOpacity"
    )
    this.otherLabel.forEach((item, index) => {
      let element = item.element.querySelector(".other-label")
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.1 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "focusMapOpacity"
      )
    })
    this.adminNameLabels?.forEach((item, index) => {
      let element = item.element.querySelector(".admin-region-label-text")
      if (!element) return
      tl.to(
        element,
        {
          duration: 0.5,
          delay: 0.04 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "adminLabel"
      )
    })
    tl.to(
      this.mapLineMaterial,
      {
        duration: 0.5,
        delay: 0.3,
        opacity: 1,
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder1.scale,
      {
        delay: 0.3,
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
      },
      "focusMapOpacity"
    )
    tl.to(
      this.rotateBorder2.scale,
      {
        duration: 1,
        delay: 0.5,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
        onComplete: () => {
          this.setFlyLineVisible(this.flyLineVisible)
          this.options.onPlayComplete && this.options.onPlayComplete()
        },
      },
      "focusMapOpacity"
    )
    this.allBar.forEach((item, index) => {
      if (item.userData.name === "广州市") {
        return false
      }
      tl.to(
        item.scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
    this.allBarMaterial.forEach((item, index) => {
      tl.to(
        item,
        {
          duration: 1,
          delay: 0.1 * index,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })

    this.allProvinceLabel.forEach((item, index) => {
      let element = item.element.querySelector(".provinces-label-wrap")
      let number = item.element.querySelector(".number .value")
      let numberVal = Number(number.innerText)
      let numberAnimate = {
        score: 0,
      }
      tl.to(
        element,
        {
          duration: 1,
          delay: 0.2 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        },
        "bar"
      )
      tl.to(
        numberAnimate,
        {
          duration: 1,
          delay: 0.2 * index,
          score: numberVal,
          onUpdate: showScore,
        },
        "bar"
      )
      function showScore() {
        number.innerText = numberAnimate.score.toFixed(0)
      }
    })
    this.allGuangquan.forEach((item, index) => {
      tl.to(
        item.children[0].scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
      tl.to(
        item.children[1].scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        "bar"
      )
    })
  }

  initEnvironment() {
    let sun = new AmbientLight(0xffffff, 5)
    this.scene.add(sun)
    let directionalLight = new DirectionalLight(0xffffff, 5)
    directionalLight.position.set(-30, 6, -8)
    directionalLight.castShadow = true
    directionalLight.shadow.radius = 20
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    this.scene.add(directionalLight)
    this.createPointLight({
      color: this.colors.pointLight,
      intensity: 800,
      distance: 10000,
      x: -9,
      y: 3,
      z: -3,
    })
    this.createPointLight({
      color: this.colors.pointLight,
      intensity: 200,
      distance: 10000,
      x: 0,
      y: 2,
      z: 5,
    })
  }
  createPointLight(pointParams) {
    const pointLight = new PointLight(pointParams.color, pointParams.intensity, pointParams.distance)
    pointLight.position.set(pointParams.x, pointParams.y, pointParams.z)
    this.scene.add(pointLight)
  }
  createMap() {
    let mapGroup = new Group()
    let focusMapGroup = new Group()
    this.mapGroup = mapGroup
    this.focusMapGroup = focusMapGroup
    let { china, chinaTopLine } = this.createChina()
    let { map, mapTop, mapLine } = this.createProvince()
    china.setParent(mapGroup)
    chinaTopLine.setParent(mapGroup)
    // 创建扩散
    this.createDiffuse()
    map.setParent(focusMapGroup)
    mapTop.setParent(focusMapGroup)
    mapLine.setParent(focusMapGroup)
    focusMapGroup.position.set(0, 0, -0.01)
    focusMapGroup.scale.set(1, 1, 0)
    mapGroup.add(focusMapGroup)
    mapGroup.rotation.x = -Math.PI / 2
    mapGroup.position.set(0, 0.2, 0)
    this.scene.add(mapGroup)
  }
  createChina() {
    let params = {
      chinaBgMaterialColor: this.colors.chinaBackground,
      lineColor: this.colors.chinaLine,
    }
    let chinaData = this.assets.instance.getResource("china")
    let chinaBgMaterial = new MeshLambertMaterial({
      color: new Color(params.chinaBgMaterialColor),
      transparent: true,
      opacity: 1,
    })
    let china = new BaseMap(this, {
      //position: new Vector3(0, 0, -0.03),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      merge: true,
      material: chinaBgMaterial,
      renderOrder: 2,
    })
    let chinaTopLineMaterial = new LineBasicMaterial({
      color: params.lineColor,
    })
    let chinaTopLine = new Line(this, {
      // position: new Vector3(0, 0, -0.02),
      data: chinaData,
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      material: chinaTopLineMaterial,
      renderOrder: 3,
    })
    chinaTopLine.lineGroup.position.z += 0.01
    return { china, chinaTopLine }
  }
  createProvince() {
    let mapJsonData = this.mapData.mapJson
    if (!mapJsonData) {
      throw new Error("请通过 data.mapJson 传入地图 GeoJSON 数据")
    }
    let [topMaterial, sideMaterial] = this.createProvinceMaterial()
    this.focusMapTopMaterial = topMaterial
    this.focusMapSideMaterial = sideMaterial
    let map = new ExtrudeMap(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, 0.11),
      data: mapJsonData,
      depth: this.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      renderOrder: 9,
    })
    let faceMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      // fog: false,
    })
    new GradientShader(faceMaterial, {
      // uColor1: 0x2a6e92,
      // uColor2: 0x102736,
      uColor1: this.colors.provinceTopStart,
      uColor2: this.colors.provinceTopEnd,
    })
    this.defaultMaterial = faceMaterial
    this.defaultLightMaterial = this.defaultMaterial.clone()
    this.defaultLightMaterial.color = new Color(this.colors.provinceHover)
    this.defaultLightMaterial.opacity = 0.8
    // this.defaultLightMaterial.emissive.setHex(new Color("rgba(115,208,255,1)"));
    // this.defaultLightMaterial.emissiveIntensity = 3.5;
    let mapTop = new BaseMap(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.22),
      data: mapJsonData,
      material: faceMaterial,
      renderOrder: 2,
    })
    mapTop.mapGroup.children.forEach((group) => {
      group.children.forEach((mesh) => {
        if (mesh.type === "Mesh") {
          this.eventElement.push(mesh)
        }
      })
    })
    this.mapLineMaterial = new LineBasicMaterial({
      color: this.colors.mapLine,
      opacity: 0,
      transparent: true,
      fog: false,
    })
    let mapLine = new Line(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      data: mapJsonData,
      material: this.mapLineMaterial,
      renderOrder: 3,
    })
    mapLine.lineGroup.position.z += this.depth + 0.23
    this.bindMapHoverRegions(map, mapTop, mapLine)
    return {
      map,
      mapTop,
      mapLine,
    }
  }
  createProvinceMaterial() {
    let topMaterial = new MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      fog: false,
      side: DoubleSide,
    })
    topMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(this.colors.provinceExtrudeTopStart) },
        uColor2: { value: new Color(this.colors.provinceExtrudeTopEnd) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.x/15.78);       
      outgoingLight = outgoingLight*gradient;
      float topAlpha = 0.5;
      if(vPosition.z>0.3){
        diffuseColor.a *= topAlpha;
      }
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    let sideMap = this.assets.instance.getResource("side")
    sideMap.wrapS = RepeatWrapping
    sideMap.wrapT = RepeatWrapping
    sideMap.repeat.set(1, 1.5)
    sideMap.offset.y += 0.065
    let sideMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: sideMap,
      fog: false,
      opacity: 0,
      side: DoubleSide,
    })
    if (this.sideMapTick) this.time.off("tick", this.sideMapTick)
    this.sideMapTick = () => {
      sideMap.offset.y += 0.005
    }
    this.time.on("tick", this.sideMapTick)
    sideMaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(this.colors.provinceSideStart) },
        uColor2: { value: new Color(this.colors.provinceSideEnd) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        attribute float alpha;
        varying vec3 vPosition;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vPosition = position;
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        varying vec3 vPosition;
        varying float vAlpha;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        void main() {
      `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
      #ifdef OPAQUE
      diffuseColor.a = 1.0;
      #endif
            #ifdef USE_TRANSMISSION
      diffuseColor.a *= transmissionAlpha + 0.1;
      #endif
      vec3 gradient = mix(uColor1, uColor2, vPosition.z/1.2);
      outgoingLight = outgoingLight*gradient;
      gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
      `
      )
    }
    return [topMaterial, sideMaterial]
  }
  hasProvinceData() {
    return Array.isArray(this.mapData.provinces) && this.mapData.provinces.length > 0
  }
  hasInfoPointData() {
    return Array.isArray(this.mapData.infoPoints) && this.mapData.infoPoints.length > 0
  }
  updateBarData(provinces = [], options = {}) {
    this.updateData({ provinces }, options)
  }
  updateInfoPointData(infoPoints = [], options = {}) {
    this.updateData({ infoPoints }, options)
  }
  createBar() {
    let self = this
    let data = sortByValue(this.mapData.provinces)
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    if (!Array.isArray(data) || data.length === 0) return null
    const barGroup = new Group()
    this.barGroup = barGroup
    const factor = 0.7
    const height = 4.0 * factor
    const max = Math.max(...data.map((item) => Number(item.value) || 0), 1)
    data.forEach((item, index) => {
      let geoHeight = height * ((Number(item.value) || 0) / max)
      let material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
        fog: false,
      })
      new GradientShader(material, {
        uColor1: index > 3 ? this.colors.barSecondaryStart : this.colors.barPrimaryStart,
        uColor2: index > 3 ? this.colors.barSecondaryEnd : this.colors.barPrimaryEnd,
        size: geoHeight,
        dir: "y",
      })
      const geo = new BoxGeometry(0.1 * factor, 0.1 * factor, geoHeight)
      geo.translate(0, 0, geoHeight / 2)
      const mesh = new Mesh(geo, material)
      mesh.renderOrder = 5
      let areaBar = mesh
      let [x, y] = this.geoProjection(item.centroid)
      areaBar.position.set(x, -y, this.depth + 0.45)
      areaBar.scale.set(1, 1, 0)
      areaBar.userData = { ...item }
      let guangQuan = this.createQuan(new Vector3(x, this.depth + 0.44, y))
      let hg = this.createHUIGUANG(geoHeight, index > 3 ? this.colors.barSecondaryGlow : this.colors.barPrimaryGlow)
      areaBar.add(...hg)
      barGroup.add(areaBar)
      barGroup.rotation.x = -Math.PI / 2
      let barLabel = labelStyle04(item, index, new Vector3(x, -y, this.depth + 1.1 + geoHeight))
      this.allBar.push(areaBar)
      this.allBarMaterial.push(material)
      this.allGuangquan.push(guangQuan)
      this.allProvinceLabel.push(barLabel)
    })
    this.scene.add(barGroup)
    this.setBarsVisible(this.barVisible)
    function labelStyle04(data, index, position) {
      let label = self.label3d.create("", "provinces-label", false)
      label.init(
        `<div class="provinces-label ${index > 2 ? "yellow" : ""}">
      <div class="provinces-label-wrap">
        <div class="name">
          <span class="zh">${data.name}</span>
        </div>
        <div class="number"><span class="value">${data.value}</span></div>
      </div>
    </div>`,
        position
      )
      self.label3d.setLabelStyle(label, self.labelScale.province, "x")
      label.setParent(self.labelGroup)
      return label
    }
  }
  createEvent() {
    let objectsHover = []
    this.eventElement.forEach((mesh) => {
      this.interactionManager.add(mesh)
      mesh.addEventListener("mousedown", (ev) => {
        this.setMapClickState(ev)
      })
      mesh.addEventListener("mouseup", (ev) => {
        this.emitMapClickIfNeeded(ev)
      })
      mesh.addEventListener("mouseover", (event) => {
        const region = this.getMapHoverRegion(event.target)
        if (!region) return
        if (!objectsHover.includes(region)) {
          objectsHover.push(region)
        }
        document.body.style.cursor = "pointer"
        this.setMapRegionHover(region, true)
      })
      mesh.addEventListener("mouseout", (event) => {
        const region = this.getMapHoverRegion(event.target)
        if (!region) return
        objectsHover = objectsHover.filter((n) => n !== region)
        this.setMapRegionHover(region, false)
        document.body.style.cursor = "default"
      })
    })
  }
  bindMapHoverRegions(map, mapTop, mapLine) {
    const extrudeGroups = map?.mapGroup?.children || []
    const topGroups = mapTop?.mapGroup?.children || []
    const lineGroups = mapLine?.lineGroup?.children || []

    this.mapHoverRegions = topGroups.map((topGroup, index) => {
      const region = {
        name: topGroup.userData?.name,
        extrudeGroup: extrudeGroups[index],
        topGroup,
        lineGroup: lineGroups[index],
        surfaceItems: [topGroup, lineGroups[index]].filter(Boolean),
        items: [topGroup, extrudeGroups[index], lineGroups[index]].filter(Boolean),
      }
      region.items.forEach((item) => {
        this.setHiddenUserData(item, "__hoverBaseZ", item.position.z || 0)
        this.setHiddenUserData(item, "__hoverRegion", region)
      })
      topGroup.children?.forEach((mesh) => {
        this.setHiddenUserData(mesh, "__hoverRegion", region)
      })
      return region
    })
  }
  setHiddenUserData(object, key, value) {
    if (!object.userData) object.userData = {}
    Object.defineProperty(object.userData, key, {
      value,
      writable: true,
      configurable: true,
    })
  }
  getMapHoverRegion(target) {
    return target?.userData?.__hoverRegion || target?.parent?.userData?.__hoverRegion || null
  }
  setMapRegionHover(region, hovered) {
    const material = hovered ? this.defaultLightMaterial : this.defaultMaterial
    region.topGroup?.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = material
      }
    })
    const liftZ = this.mapHoverGrowEnabled && hovered ? this.mapHoverGrowHeight : 0
    region.items.forEach((item) => {
      const baseZ = item.userData.__hoverBaseZ ?? 0
      gsap.killTweensOf(item.position)
      gsap.to(item.position, {
        duration: this.mapHoverGrowDuration,
        z: baseZ + liftZ,
        ease: "power2.out",
      })
    })
  }
  getEventPointer(event) {
    const originalEvent = event?.originalEvent || event
    const touch = originalEvent?.changedTouches?.[0] || originalEvent?.touches?.[0]
    const clientX = originalEvent?.clientX ?? touch?.clientX
    const clientY = originalEvent?.clientY ?? touch?.clientY
    if (typeof clientX !== "number" || typeof clientY !== "number") return null
    return { x: clientX, y: clientY }
  }
  setMapClickState(ev) {
    if (this.isInfoPointHit()) {
      this.mapClickState = null
      return false
    }
    const originalEvent = ev?.originalEvent
    if (typeof originalEvent?.button === "number" && originalEvent.button !== 0) {
      this.mapClickState = null
      return false
    }
    this.mapClickState = {
      target: ev.target,
      pointer: this.getEventPointer(ev),
      data: {
        ...(ev.target.parent?.userData || {}),
        ...(ev.target.userData || {}),
      },
    }
    return true
  }
  emitMapClickIfNeeded(ev) {
    const clickState = this.mapClickState
    if (!clickState || clickState.target !== ev.target) return false
    this.mapClickState = null
    if (this.isInfoPointHit()) return false
    const startPointer = clickState.pointer
    const endPointer = this.getEventPointer(ev)
    if (startPointer && endPointer) {
      const deltaX = endPointer.x - startPointer.x
      const deltaY = endPointer.y - startPointer.y
      const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      if (moveDistance > this.mapClickMoveThreshold) return false
    }
    this.options.onMapClick && this.options.onMapClick(clickState.data)
    return true
  }
  createHUIGUANG(h, color) {
    let geometry = new PlaneGeometry(0.35, h)
    geometry.translate(0, h / 2, 0)
    const texture = this.assets.instance.getResource("huiguang")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    let material = new MeshBasicMaterial({
      color: color,
      map: texture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 10
    mesh.rotateX(Math.PI / 2)
    let mesh2 = mesh.clone()
    let mesh3 = mesh.clone()
    mesh2.rotateY((Math.PI / 180) * 60)
    mesh3.rotateY((Math.PI / 180) * 120)
    return [mesh, mesh2, mesh3]
  }
  createQuan(position) {
    const guangquan1 = this.assets.instance.getResource("guangquan1")
    const guangquan2 = this.assets.instance.getResource("guangquan2")
    let geometry = new PlaneGeometry(0.5, 0.5)
    let material1 = new MeshBasicMaterial({
      color: this.colors.barCircle,
      map: guangquan1,
      alphaMap: guangquan1,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let material2 = new MeshBasicMaterial({
      color: this.colors.barCircle,
      map: guangquan2,
      alphaMap: guangquan2,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
      blending: AdditiveBlending,
    })
    let mesh1 = new Mesh(geometry, material1)
    let mesh2 = new Mesh(geometry, material2)
    mesh1.renderOrder = 6
    mesh2.renderOrder = 6
    mesh1.rotateX(-Math.PI / 2)
    mesh2.rotateX(-Math.PI / 2)
    mesh1.position.copy(position)
    mesh2.position.copy(position)
    mesh2.position.y -= 0.001
    mesh1.scale.set(0, 0, 0)
    mesh2.scale.set(0, 0, 0)
    this.quanGroup = new Group()
    this.quanGroup.add(mesh1, mesh2)
    this.scene.add(this.quanGroup)
    const tick = () => {
      mesh1.rotation.z += 0.05
    }
    this.quanTicks.push(tick)
    this.time.on("tick", tick)
    return this.quanGroup
  }
  // 创建扩散
  createDiffuse() {
    let geometry = new PlaneGeometry(200, 200)
    let material = new MeshBasicMaterial({
      color: this.colors.diffuseBase,
      depthWrite: false,
      // depthTest: false,
      transparent: true,
      blending: CustomBlending,
    })
    // 使用CustomBlending  实现混合叠加
    material.blendEquation = AddEquation
    material.blendSrc = DstColorFactor
    material.blendDst = OneFactor
    new DiffuseShader({
      material,
      time: this.time,
      size: 60,
      diffuseSpeed: 8.0,
      diffuseColor: this.colors.diffuse,
      diffuseWidth: 2.0,
      callback: (pointShader) => {
        setTimeout(() => {
          gsap.to(pointShader.uniforms.uTime, {
            value: 4,
            repeat: -1,
            duration: 6,
            ease: "power1.easeIn",
          })
        }, 3)
      },
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 3
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, 0.21, 0)
    mesh.visible = this.diffuseVisible
    this.diffuseMesh = mesh
    this.scene.add(mesh)
  }
  createGrid() {
    this.grid = new Grid(this, {
      gridSize: 50,
      gridDivision: 20,
      gridColor: this.colors.gridLine,
      shapeSize: 0.5,
      shapeColor: this.colors.gridShape,
      pointSize: 0.1,
      pointColor: this.colors.gridPoint,
    })
  }
  createBottomBg() {
    let geometry = new PlaneGeometry(20, 20)
    const texture = this.assets.instance.getResource("ocean")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      opacity: 1,
      fog: false,
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(0, -0.7, 0)
    this.bottomBgMesh = mesh
    this.scene.add(mesh)
  }
  createChinaBlurLine() {
    let geometry = new PlaneGeometry(147, 147)
    const texture = this.assets.instance.getResource("chinaBlurLine")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.generateMipmaps = false
    texture.minFilter = NearestFilter
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      color: this.colors.chinaBlurLine,
      alphaMap: texture,
      transparent: true,
      opacity: 0.5,
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.set(-19.3, -0.5, -19.7)
    this.chinaBlurLineMesh = mesh
    this.scene.add(mesh)
  }

  createLabel() {
    let self = this
    let labelGroup = this.labelGroup
    let label3d = this.label3d
    let otherLabel = []
    let adminNameLabels = []
    let mapFocusLabel = labelStyle02(
      {
        ...this.mapFocusLabelInfo,
      },
      label3d,
      labelGroup
    )
    otherLabel.push(mapFocusLabel)
    if (this.adminLabel.visible) {
      adminNameLabels = createAdminNameLabels()
    }
    this.otherLabel = otherLabel
    this.adminNameLabels = adminNameLabels
    function labelStyle02(province, label3d, labelGroup) {
      let label = label3d.create("", "map-label", false)
      const [x, y] = self.geoProjection(province.center)
      label.init(
        `<div class="other-label" style="text-align: center"><span>${province.name}</span><span>${province.enName}</span></div>`,
        new Vector3(x, -y, 0.4)
      )
      label3d.setLabelStyle(label, self.labelScale.map, "x")
      label.setParent(labelGroup)
      return label
    }
    function createAdminNameLabels() {
      const mapJson = self.mapData.mapJson
      if (!mapJson?.features?.length) return []
      return mapJson.features
        .map((feature) => {
          const properties = feature.properties || {}
          const text = properties[self.adminLabel.field] ?? properties.name
          const center = getFeatureCenter(feature)
          if (!text || !center) return null
          const [x, y] = self.geoProjection(center)
          const label = label3d.create("", "admin-region-label", false)
          label.init(
            `<div class="admin-region-label-text" style="color: ${self.adminLabel.color};">${escapeHtml(text)}</div>`,
            new Vector3(x, -y, self.adminLabel.height)
          )
          label3d.setLabelStyle(label, self.adminLabel.scale, "x")
          label.setParent(labelGroup)
          return label
        })
        .filter(Boolean)
    }
    function getFeatureCenter(feature) {
      const properties = feature.properties || {}
      if (Array.isArray(properties.centroid) && properties.centroid.length >= 2) return properties.centroid
      if (Array.isArray(properties.center) && properties.center.length >= 2) return properties.center
      const points = []
      collectCoordinates(feature.geometry?.coordinates, points)
      if (!points.length) return null
      const lngs = points.map((point) => point[0])
      const lats = points.map((point) => point[1])
      return [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2]
    }
    function collectCoordinates(coordinates, points) {
      if (!Array.isArray(coordinates)) return
      if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
        points.push(coordinates)
        return
      }
      coordinates.forEach((item) => collectCoordinates(item, points))
    }
    function escapeHtml(value) {
      return `${value ?? ""}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    }
  }
  createRotateBorder() {
    let max = this.rotateBorderSize
    let rotationBorder1 = this.assets.instance.getResource("rotationBorder1")
    let rotationBorder2 = this.assets.instance.getResource("rotationBorder2")
    let plane01 = new Plane(this, {
      width: max * 1.178,
      needRotate: true,
      rotateSpeed: 0.001,
      material: new MeshBasicMaterial({
        map: rotationBorder1,
        color: this.colors.rotateBorder,
        transparent: true,
        opacity: 0.2,
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(0, 0.28, 0),
    })
    plane01.instance.rotation.x = -Math.PI / 2
    plane01.instance.renderOrder = 6
    plane01.instance.visible = this.rotateBorderVisible
    plane01.instance.scale.set(0, 0, 0)
    plane01.setParent(this.scene)
    let plane02 = new Plane(this, {
      width: max * 1.116,
      needRotate: true,
      rotateSpeed: -0.004,
      material: new MeshBasicMaterial({
        map: rotationBorder2,
        color: this.colors.rotateBorder,
        transparent: true,
        opacity: 0.4,
        side: DoubleSide,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
      position: new Vector3(0, 0.3, 0),
    })
    plane02.instance.rotation.x = -Math.PI / 2
    plane02.instance.renderOrder = 6
    plane02.instance.visible = this.rotateBorderVisible
    plane02.instance.scale.set(0, 0, 0)
    plane02.setParent(this.scene)
    this.rotateBorder1 = plane01.instance
    this.rotateBorder2 = plane02.instance
  }
  setRotateBorderVisible(visible = true) {
    this.rotateBorderVisible = visible
    if (this.mapData) this.mapData.rotateBorderVisible = visible
    if (this.rotateBorder1) this.rotateBorder1.visible = visible
    if (this.rotateBorder2) this.rotateBorder2.visible = visible
  }
  setBottomBgVisible(visible = true) {
    this.bottomBgVisible = visible
    if (this.mapData) this.mapData.bottomBgVisible = visible
    if (visible && !this.bottomBgMesh) {
      this.createBottomBg()
    }
    if (this.bottomBgMesh) this.bottomBgMesh.visible = visible
  }
  setRotateBorderSize(size = 12) {
    this.rotateBorderSize = size
    if (this.mapData) this.mapData.rotateBorderSize = size
    if (this.rotateBorder1) {
      this.rotateBorder1.geometry.dispose()
      this.rotateBorder1.geometry = new PlaneGeometry(size * 1.178, size * 1.178)
    }
    if (this.rotateBorder2) {
      this.rotateBorder2.geometry.dispose()
      this.rotateBorder2.geometry = new PlaneGeometry(size * 1.116, size * 1.116)
    }
  }
  setBarsVisible(visible = true) {
    this.barVisible = visible
    if (this.mapData) this.mapData.barVisible = visible
    if (visible && !this.barGroup && this.hasProvinceData()) this.createBar()
    if (this.barGroup) this.barGroup.visible = visible
    this.allGuangquan?.forEach((item) => {
      item.visible = visible
    })
    this.allProvinceLabel?.forEach((item) => {
      item.visible = visible
    })
  }
  setInfoPointVisible(visible = true) {
    this.infoPointVisible = visible
    if (this.mapData) this.mapData.infoPointVisible = visible
    if (visible && !this.InfoPointGroup && this.hasInfoPointData()) this.createInfoPoint()
    if (this.InfoPointGroup) this.InfoPointGroup.visible = visible
    if (visible && this.InfoPointGroup) {
      this.createInfoPointLabelLoop()
    } else {
      clearInterval(this.infoPointLabelTime)
      this.infoLabelElement?.forEach((label) => {
        label.visible = false
      })
    }
  }
  setFlyLineVisible(visible = true) {
    this.flyLineVisible = visible
    if (this.mapData) this.mapData.flyLineVisible = visible
    if (this.flyLineGroup) this.flyLineGroup.visible = visible
    if (this.flyLineFocusGroup) this.flyLineFocusGroup.visible = visible
  }
  setDiffuseVisible(visible = true) {
    this.diffuseVisible = visible
    if (this.mapData) this.mapData.diffuseVisible = visible
    if (this.diffuseMesh) this.diffuseMesh.visible = visible
  }
  createFlyLine() {
    this.flyLineGroup = new Group()
    this.flyLineGroup.visible = false
    this.scene.add(this.flyLineGroup)
    if (!this.hasProvinceData()) return
    const texture = this.assets.instance.getResource("mapFlyline")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(0.5, 2)
    const tubeRadius = 0.1
    const tubeSegments = 32
    const tubeRadialSegments = 2
    const closed = false
    let [centerX, centerY] = this.geoProjection(this.flyLineCenter)
    let centerPoint = new Vector3(centerX, -centerY, 0)
    const material = new MeshBasicMaterial({
      map: texture,
      // alphaMap: texture,
      color: this.colors.flyLine,
      transparent: true,
      fog: false,
      opacity: 1,
      depthTest: false,
      blending: AdditiveBlending,
    })
    this.flyLineTick = () => {
      texture.offset.x -= 0.006
    }
    this.time.on("tick", this.flyLineTick)
    this.mapData.provinces.forEach((city) => {
      let [x, y] = this.geoProjection(city.centroid)
      let point = new Vector3(x, -y, 0)
      const center = new Vector3()
      center.addVectors(centerPoint, point).multiplyScalar(0.5)
      center.setZ(3)
      const curve = new QuadraticBezierCurve3(centerPoint, center, point)
      const tubeGeometry = new TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, closed)
      const mesh = new Mesh(tubeGeometry, material)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(0, this.depth + 0.44, 0)
      mesh.renderOrder = 21
      this.flyLineGroup.add(mesh)
    })
  }
  // 创建焦点
  createFocus() {
    let focusObj = new Focus(this, { color1: this.colors.flyLineFocusStart, color2: this.colors.flyLineFocusEnd })
    this.focusObj = focusObj
    let [x, y] = this.geoProjection(this.flyLineCenter)
    focusObj.position.set(x, -y, this.depth + 0.44)
    focusObj.scale.set(1, 1, 1)
    this.flyLineFocusGroup.add(focusObj)
  }
  // 创建粒子
  createParticles() {
    this.particles = new Particles(this, {
      num: 10,
      range: 30,
      dir: "up",
      speed: 0.05,
      material: new PointsMaterial({
        map: Particles.createTexture(),
        size: 1,
        color: this.colors.particle,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    })
    this.particleGroup = new Group()
    this.scene.add(this.particleGroup)
    this.particleGroup.rotation.x = -Math.PI / 2
    this.particles.setParent(this.particleGroup)
    this.particles.enable = true
    this.particleGroup.visible = true
  }
  createInfoPoint() {
    let self = this
    if (!this.hasInfoPointData()) return null
    this.InfoPointGroup = new Group()
    this.scene.add(this.InfoPointGroup)
    this.InfoPointGroup.visible = false
    this.InfoPointGroup.rotation.x = -Math.PI / 2
    this.infoPointIndex = 0
    this.infoPointLabelTime = null
    this.infoLabelElement = []
    let label3d = this.label3d
    const texture = this.assets.instance.getResource("point")
    let colors = this.colors.infoPointColors
    let infoAllData = sortByValue([...this.mapData.infoPoints])
    let max = Math.max(...infoAllData.map((item) => Number(item.value) || 0), 1)
    infoAllData.forEach((data, index) => {
      const material = new SpriteMaterial({
        map: texture,
        color: colors[index % colors.length],
        fog: false,
        transparent: true,
        depthTest: false,
      })
      const sprite = new Sprite(material)
      sprite.renderOrder = 23
      let scale = 0.7 + ((Number(data.value) || 0) / max) * 0.4
      sprite.scale.set(scale, scale, scale)
      let [x, y] = this.geoProjection([data.lon, data.lat])
      let position = [x, -y, this.depth + 0.7]
      sprite.position.set(...position)
      sprite.userData = {
        ...data,
        position: [x, -y, this.depth + 0.7],
        index: index,
      }
      this.InfoPointGroup.add(sprite)
      let label = infoLabel(data, label3d, this.InfoPointGroup)
      this.infoLabelElement.push(label)
      this.interactionManager.add(sprite)
      sprite.addEventListener("mousedown", (ev) => {
        ev.stopPropagation?.()
        if (this.clicked || !this.InfoPointGroup.visible) return false
        this.clicked = true
        this.infoPointIndex = ev.target.userData.index
        this.infoLabelElement.forEach((label) => {
          label.visible = false
        })
        label.visible = true
        this.createInfoPointLabelLoop()
      })
      sprite.addEventListener("mouseup", () => {
        this.clicked = false
      })
      sprite.addEventListener("mouseover", () => {
        document.body.style.cursor = "pointer"
      })
      sprite.addEventListener("mouseout", () => {
        document.body.style.cursor = "default"
      })
    })
    function infoLabel(data, label3d, labelGroup) {
      let label = label3d.create("", "info-point", true)
      const [x, y] = self.geoProjection([data.lon, data.lat])
      label.init(
        ` <div class="info-point-wrap">
          <div class="info-point-wrap-inner">
            <div class="info-point-content">${renderInfoRows(data)}</div>
          </div>
        </div>
      `,
        new Vector3(x, -y, self.depth + 1.9)
      )
      label3d.setLabelStyle(label, self.labelScale.infoPoint, "x")
      label.setParent(labelGroup)
      label.visible = false
      return label
    }
    function renderInfoRows(data) {
      return getInfoRows(data)
        .map((item) => {
          const unit = item.unit == null ? "" : item.unit
          return `<div class="content-item"><span class="label">${escapeHtml(item.name)}</span><span class="value">${escapeHtml(item.value)}${escapeHtml(unit)}</span></div>`
        })
        .join("")
    }
    function getInfoRows(data) {
      const rows = data.items || data.content || data.details || data.list
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((item) => ({
          name: item.name ?? "",
          value: item.value ?? "",
          unit: item.unit ?? "",
        }))
      }
      return [
        { name: "名称", value: data.name, unit: "" },
        { name: "数值", value: data.value, unit: data.unit || "" },
        { name: "等级", value: data.level, unit: "" },
      ].filter((item) => item.value != null && item.value !== "")
    }
    function escapeHtml(value) {
      return `${value ?? ""}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    }
  }
  isInfoPointHit() {
    if (!this.InfoPointGroup?.visible || !this.interactionManager?.raycaster) return false
    return this.interactionManager.raycaster.intersectObjects(this.InfoPointGroup.children || [], true).length > 0
  }
  createInfoPointLabelLoop() {
    clearInterval(this.infoPointLabelTime)
    if (!this.infoLabelElement || this.infoLabelElement.length === 0) return
    this.infoPointLabelTime = setInterval(() => {
      this.infoPointIndex++
      if (this.infoPointIndex >= this.infoLabelElement.length) {
        this.infoPointIndex = 0
      }
      this.infoLabelElement.forEach((label, i) => {
        if (this.infoPointIndex === i) {
          label.visible = true
        } else {
          label.visible = false
        }
      })
    }, 3000)
  }
  createStorke() {
    const mapStroke = this.mapData.mapStroke
    if (!mapStroke) return
    const texture = this.assets.instance.getResource("pathLine3")
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(2, 1)

    let pathLine = new Line(this, {
      geoProjectionCenter: this.geoProjectionCenter,
      geoProjectionScale: this.geoProjectionScale,
      position: new Vector3(0, 0, this.depth + 0.24),
      data: mapStroke,
      material: new MeshBasicMaterial({
        color: this.colors.strokeLine,
        map: texture,
        alphaMap: texture,
        fog: false,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
      }),
      type: "Line3",
      renderOrder: 22,
      tubeRadius: 0.03,
    })
    // 设置父级
    this.mapStrokeLineGroup = pathLine.lineGroup
    this.focusMapGroup.add(pathLine.lineGroup)
    this.mapStrokeTick = () => {
      texture.offset.x += 0.005
    }
    this.time.on("tick", this.mapStrokeTick)
  }

  updateData(data = {}, options = {}) {
    const shouldReveal = options.reveal !== false
    const mapChanged = !!(data.mapJson || data.mapStroke || data.geoProjectionCenter || data.geoProjectionScale || data.flyLineCenter)
    const colorsChanged = !!data.colors
    const adminLabelChanged =
      !!data.adminLabel ||
      Object.prototype.hasOwnProperty.call(data, "adminLabelVisible") ||
      Object.prototype.hasOwnProperty.call(data, "adminLabelColor") ||
      Object.prototype.hasOwnProperty.call(data, "adminLabelScale") ||
      Object.prototype.hasOwnProperty.call(data, "adminLabelHeight") ||
      Object.prototype.hasOwnProperty.call(data, "adminLabelField")
    const labelScaleChanged =
      !!data.labelScale ||
      Object.prototype.hasOwnProperty.call(data, "mapLabelScale") ||
      Object.prototype.hasOwnProperty.call(data, "provinceLabelScale") ||
      Object.prototype.hasOwnProperty.call(data, "infoPointLabelScale")

    if (data.geoProjectionCenter) this.geoProjectionCenter = data.geoProjectionCenter
    if (data.geoProjectionScale) this.geoProjectionScale = data.geoProjectionScale
    if (data.flyLineCenter) this.flyLineCenter = data.flyLineCenter
    if (adminLabelChanged) this.adminLabel = normalizeAdminLabel(data, this.adminLabel)
    if (labelScaleChanged) this.labelScale = normalizeLabelScale(data, this.labelScale)
    if (colorsChanged) {
      this.colors = normalizeMapColors(data, this.colors)
      this.scene.background = new Color(this.colors.sceneBackground)
    }
    if (Object.prototype.hasOwnProperty.call(data, "bottomBgVisible")) {
      this.setBottomBgVisible(data.bottomBgVisible)
    }
    if (data.cameraControls) this.setCameraControls(data.cameraControls)
    if (data.rotateBorderSize != null) this.setRotateBorderSize(data.rotateBorderSize)
    if (Object.prototype.hasOwnProperty.call(data, "rotateBorderVisible")) {
      this.setRotateBorderVisible(data.rotateBorderVisible)
    }
    if (Object.prototype.hasOwnProperty.call(data, "barVisible")) {
      this.setBarsVisible(data.barVisible)
    }
    if (Object.prototype.hasOwnProperty.call(data, "infoPointVisible")) {
      this.setInfoPointVisible(data.infoPointVisible)
    }
    if (Object.prototype.hasOwnProperty.call(data, "flyLineVisible")) {
      this.setFlyLineVisible(data.flyLineVisible)
    }
    if (Object.prototype.hasOwnProperty.call(data, "centerFlyLineVisible")) {
      this.setFlyLineVisible(data.centerFlyLineVisible)
    }
    if (Object.prototype.hasOwnProperty.call(data, "diffuseVisible")) {
      this.setDiffuseVisible(data.diffuseVisible)
    }
    if (
      Object.prototype.hasOwnProperty.call(data, "mapHoverLiftEnabled") ||
      Object.prototype.hasOwnProperty.call(data, "hoverLiftEnabled") ||
      Object.prototype.hasOwnProperty.call(data, "mapHoverGrowEnabled") ||
      Object.prototype.hasOwnProperty.call(data, "hoverGrowEnabled")
    ) {
      this.mapHoverGrowEnabled =
        data.mapHoverLiftEnabled ?? data.hoverLiftEnabled ?? data.mapHoverGrowEnabled ?? data.hoverGrowEnabled
    }
    if (
      data.mapHoverGrowHeight != null ||
      data.hoverGrowHeight != null ||
      data.mapHoverLiftHeight != null ||
      data.hoverLiftHeight != null
    ) {
      this.mapHoverGrowHeight =
        data.mapHoverGrowHeight ?? data.hoverGrowHeight ?? data.mapHoverLiftHeight ?? data.hoverLiftHeight
    }
    if (
      data.mapHoverGrowDuration != null ||
      data.hoverGrowDuration != null ||
      data.mapHoverLiftDuration != null ||
      data.hoverLiftDuration != null
    ) {
      this.mapHoverGrowDuration =
        data.mapHoverGrowDuration ?? data.hoverGrowDuration ?? data.mapHoverLiftDuration ?? data.hoverLiftDuration
    }

    this.mapData = {
      ...this.mapData,
      ...data,
      cameraControls: data.cameraControls || this.mapData.cameraControls,
      bottomBgVisible: this.bottomBgVisible,
      adminLabel: this.adminLabel,
      labelScale: this.labelScale,
      colors: this.colors,
    }

    if (colorsChanged) {
      if (data.mapFocusLabelInfo) {
        this.mapFocusLabelInfo = {
          ...this.mapFocusLabelInfo,
          ...data.mapFocusLabelInfo,
        }
      }
      this.rebuildTheme({ reveal: shouldReveal })
      return
    }

    if (mapChanged) {
      if (data.mapFocusLabelInfo) {
        this.mapFocusLabelInfo = {
          ...this.mapFocusLabelInfo,
          ...data.mapFocusLabelInfo,
        }
      }
      this.rebuildMap({
        reveal: shouldReveal,
      })
      this.rebuildLabels({ reveal: shouldReveal })
      return
    }

    if (data.provinces || labelScaleChanged) {
      this.rebuildBars({ reveal: shouldReveal })
      if (data.provinces) this.rebuildFlyLines(this.flyLineVisible)
    }
    if (data.infoPoints || labelScaleChanged) {
      this.rebuildInfoPoints(this.infoPointVisible)
    }
      if (data.mapFocusLabelInfo) {
        this.mapFocusLabelInfo = {
          ...this.mapFocusLabelInfo,
          ...data.mapFocusLabelInfo,
        }
      }
      this.rebuildLabels({ reveal: shouldReveal })
  }

  rebuildTheme({ reveal = true } = {}) {
    this.barAnimateTl?.kill()
    this.barAnimateTl = null
    clearInterval(this.infoPointLabelTime)
    if (this.flyLineTick) this.time.off("tick", this.flyLineTick)
    if (this.mapStrokeTick) this.time.off("tick", this.mapStrokeTick)
    if (this.sideMapTick) this.time.off("tick", this.sideMapTick)
    this.quanTicks?.forEach((tick) => this.time.off("tick", tick))
    this.quanTicks = []
    this.focusObj?.destroy?.()

    this.scene.traverse((child) => {
      if (child.isPointLight) child.color.set(this.colors.pointLight)
    })

    this.cleanupLabels(this.otherLabel)
    this.cleanupLabels(this.adminNameLabels)
    this.cleanupLabels(this.allProvinceLabel)
    this.cleanupLabels(this.infoLabelElement)
    this.removeGroup(this.labelGroup)
    this.removeGroup(this.mapGroup)
    this.removeGroup(this.barGroup)
    this.cleanupGroups(this.allGuangquan)
    this.removeGroup(this.flyLineGroup)
    this.removeGroup(this.flyLineFocusGroup)
    this.removeGroup(this.InfoPointGroup)
    this.removeGroup(this.mapStrokeLineGroup)
    this.removeGroup(this.diffuseMesh)
    this.removeGroup(this.rotateBorder1)
    this.removeGroup(this.rotateBorder2)
    this.removeGroup(this.grid?.instance)
    this.removeGroup(this.particleGroup)
    this.removeGroup(this.chinaBlurLineMesh)
    this.removeGroup(this.bottomBgMesh)

    this.labelGroup = new Group()
    this.labelGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.labelGroup)
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.flyLineFocusGroup.rotation.x = -Math.PI / 2
    this.scene.add(this.flyLineFocusGroup)

    this.eventElement = []
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    this.adminNameLabels = []
    this.infoLabelElement = []
    this.mapStrokeLineGroup = null
    this.barGroup = null
    this.flyLineGroup = null
    this.InfoPointGroup = null
    this.diffuseMesh = null
    this.rotateBorder1 = null
    this.rotateBorder2 = null
    this.grid = null
    this.particleGroup = null
    this.chinaBlurLineMesh = null
    this.bottomBgMesh = null
    this.focusObj = null

    if (this.bottomBgVisible) this.createBottomBg()
    this.createChinaBlurLine()
    this.createGrid()
    this.createRotateBorder()
    this.createLabel()
    this.createMap()
    if (this.hasProvinceData()) this.createBar()
    this.createEvent()
    this.createFlyLine()
    this.createFocus()
    this.createParticles()
    if (this.hasInfoPointData()) this.createInfoPoint()
    this.createStorke()
    if (reveal) {
      this.revealMap()
      this.revealOtherLabels()
      this.revealBars()
    }
  }

  rebuildMap({ reveal = true } = {}) {
    const focusPosition = this.focusMapGroup?.position?.clone()
    const focusScale = this.focusMapGroup?.scale?.clone()

    this.removeGroup(this.focusMapGroup)
    this.eventElement = []
    this.focusMapGroup = new Group()

    let { map, mapTop, mapLine } = this.createProvince()
    map.setParent(this.focusMapGroup)
    mapTop.setParent(this.focusMapGroup)
    mapLine.setParent(this.focusMapGroup)
    this.focusMapGroup.position.copy(focusPosition || new Vector3(0, 0, 0))
    this.focusMapGroup.scale.copy(focusScale || new Vector3(1, 1, 1))
    this.mapGroup.add(this.focusMapGroup)

    this.rebuildBars({ reveal })
    this.rebuildFlyLines(this.flyLineVisible)
    this.rebuildInfoPoints(this.infoPointVisible)
    this.rebuildMapStroke()
    this.createEvent()
  }

  rebuildMapStroke() {
    if (this.mapStrokeTick) {
      this.time.off("tick", this.mapStrokeTick)
      this.mapStrokeTick = null
    }
    this.removeGroup(this.mapStrokeLineGroup)
    this.mapStrokeLineGroup = null
    this.createStorke()
  }

  rebuildBars({ reveal = true } = {}) {
    this.barAnimateTl?.kill()
    this.barAnimateTl = null
    this.quanTicks?.forEach((tick) => this.time.off("tick", tick))
    this.quanTicks = []
    this.removeGroup(this.barGroup)
    this.cleanupGroups(this.allGuangquan)
    this.cleanupLabels(this.allProvinceLabel)
    this.barGroup = null
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    this.createBar()
    if (reveal) this.animateBars()
  }

  rebuildFlyLines(visible = true) {
    if (this.flyLineTick) {
      this.time.off("tick", this.flyLineTick)
      this.flyLineTick = null
    }
    this.removeGroup(this.flyLineGroup)
    this.flyLineGroup = null
    this.createFlyLine()
    this.flyLineGroup.visible = visible !== false
  }

  animateBars() {
    this.barAnimateTl?.kill()
    const tl = gsap.timeline()
    this.barAnimateTl = tl

    this.allBar?.forEach((item, index) => {
      tl.to(
        item.scale,
        {
          duration: 1,
          delay: 0.1 * index,
          x: 1,
          y: 1,
          z: 1,
          ease: "circ.out",
        },
        0
      )
    })
    this.allBarMaterial?.forEach((item, index) => {
      tl.to(
        item,
        {
          duration: 1,
          delay: 0.1 * index,
          opacity: 1,
          ease: "circ.out",
        },
        0
      )
    })
    this.allProvinceLabel?.forEach((item, index) => {
      const element = item.element.querySelector(".provinces-label-wrap")
      const number = item.element.querySelector(".number .value")
      const numberVal = Number(number?.innerText) || 0
      const numberAnimate = { score: 0 }

      if (number) number.innerText = "0"
      if (element) {
        tl.to(
          element,
          {
            duration: 1,
            delay: 0.2 * index,
            translateY: 0,
            opacity: 1,
            ease: "circ.out",
          },
          0
        )
      }
      if (number) {
        tl.to(
          numberAnimate,
          {
            duration: 1,
            delay: 0.2 * index,
            score: numberVal,
            onUpdate: () => {
              number.innerText = numberAnimate.score.toFixed(0)
            },
          },
          0
        )
      }
    })
    this.allGuangquan?.forEach((item, index) => {
      item.children?.forEach((child) => {
        tl.to(
          child.scale,
          {
            duration: 1,
            delay: 0.1 * index,
            x: 1,
            y: 1,
            z: 1,
            ease: "circ.out",
          },
          0
        )
      })
    })
  }

  rebuildInfoPoints(visible = true) {
    clearInterval(this.infoPointLabelTime)
    this.cleanupLabels(this.infoLabelElement)
    this.removeGroup(this.InfoPointGroup)
    this.InfoPointGroup = null
    this.infoLabelElement = []
    if (!this.hasInfoPointData()) return
    this.createInfoPoint()
    if (!this.InfoPointGroup) return
    this.InfoPointGroup.visible = visible !== false
    if (this.InfoPointGroup.visible) this.createInfoPointLabelLoop()
  }

  rebuildLabels({ reveal = true } = {}) {
    this.cleanupLabels(this.otherLabel)
    this.cleanupLabels(this.adminNameLabels)
    this.otherLabel = []
    this.adminNameLabels = []
    this.createLabel()
    if (reveal) this.revealOtherLabels()
  }

  revealMap() {
    this.focusMapGroup?.scale.set(1, 1, 1)
    if (this.focusMapTopMaterial) this.focusMapTopMaterial.opacity = 1
    if (this.focusMapSideMaterial) {
      this.focusMapSideMaterial.opacity = 1
      this.focusMapSideMaterial.transparent = false
    }
    if (this.mapLineMaterial) this.mapLineMaterial.opacity = 1
    this.setFlyLineVisible(this.flyLineVisible)
    this.setInfoPointVisible(this.infoPointVisible)
  }

  revealBars() {
    this.allBar?.forEach((item) => {
      item.scale.set(1, 1, 1)
    })
    this.allBarMaterial?.forEach((item) => {
      item.opacity = 1
    })
    this.allGuangquan?.forEach((item) => {
      item.children?.forEach((child) => child.scale.set(1, 1, 1))
    })
    this.allProvinceLabel?.forEach((item) => {
      const element = item.element.querySelector(".provinces-label-wrap")
      if (element) {
        element.style.transform = "translate(50%, 0)"
        element.style.opacity = 1
      }
    })
  }

  revealOtherLabels() {
    this.otherLabel?.forEach((item) => {
      const element = item.element.querySelector(".other-label")
      if (element) {
        element.style.transform = "translateY(0)"
        element.style.opacity = 1
      }
    })
    this.adminNameLabels?.forEach((item) => {
      const element = item.element.querySelector(".admin-region-label-text")
      if (element) {
        element.style.transform = "translateY(0)"
        element.style.opacity = 1
      }
    })
  }

  cleanupLabels(labels = []) {
    labels?.forEach((label) => {
      label.parent?.remove(label)
      if (label.element?.parentNode) {
        label.element.parentNode.removeChild(label.element)
      }
    })
  }

  cleanupGroups(groups = []) {
    groups?.forEach((group) => this.removeGroup(group))
  }

  removeGroup(group) {
    if (!group) return
    group.parent?.remove(group)
    group.traverse?.((child) => {
      if (child.geometry) child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material?.dispose?.())
      } else {
        child.material?.dispose?.()
      }
    })
  }

  geoProjection(args) {
    return geoMercator().center(this.geoProjectionCenter).scale(this.geoProjectionScale).translate([0, 0])(args)
  }
  update() {
    super.update()
    this.interactionManager && this.interactionManager.update()
  }
  destroy() {
    clearInterval(this.infoPointLabelTime)
    this.barAnimateTl?.kill()
    if (this.flyLineTick) this.time.off("tick", this.flyLineTick)
    if (this.mapStrokeTick) this.time.off("tick", this.mapStrokeTick)
    if (this.sideMapTick) this.time.off("tick", this.sideMapTick)
    this.quanTicks?.forEach((tick) => this.time.off("tick", tick))
    super.destroy()
    this.label3d && this.label3d.destroy()
  }
}

export { Map3DWorld as World }
