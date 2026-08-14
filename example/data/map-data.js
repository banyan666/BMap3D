import mapJson from './陕西省.json'
import mapStroke from './陕西省_轮廓.json'

export const provinceData = [
  { adcode: 610100, name: '西安市', centroid: [108.797426, 34.10671], value: 100 },
  { adcode: 610800, name: '榆林市', centroid: [109.577105, 38.048207], value: 94 },
  { adcode: 610600, name: '延安市', centroid: [109.319393, 36.442397], value: 88 },
  { adcode: 610300, name: '宝鸡市', centroid: [107.205191, 34.380063], value: 82 },
  { adcode: 610400, name: '咸阳市', centroid: [108.394642, 34.785702], value: 76 },
  { adcode: 610500, name: '渭南市', centroid: [109.856208, 34.950969], value: 70 },
  { adcode: 610700, name: '汉中市', centroid: [107.106739, 33.090936], value: 64 },
  { adcode: 610900, name: '安康市', centroid: [108.929995, 32.759384], value: 58 },
  { adcode: 611000, name: '商洛市', centroid: [109.907166, 33.647601], value: 52 },
  { adcode: 610200, name: '铜川市', centroid: [109.038368, 35.195996], value: 46 },
]

export const infoPointData = [
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
  {
    name: '榆林能源监测站',
    lon: 109.577105,
    lat: 38.048207,
    value: 16,
    items: [
      { name: '设备在线', value: 52, unit: '台' },
      { name: '今日告警', value: 3, unit: '条' },
    ],
  },
  {
    name: '汉中生态监测站',
    lon: 107.106739,
    lat: 33.090936,
    value: 10,
    items: [
      { name: '设备在线', value: 41, unit: '台' },
      { name: '今日告警', value: 1, unit: '条' },
    ],
  },
]

export function createMapData() {
  return {
    mapJson,
    mapStroke,
    geoProjectionCenter: [108.887114, 35.263661],
    geoProjectionScale: 85,
    flyLineCenter: [108.948024, 34.263161],
    rotateBorderSize: 24,
    bottomBgVisible: false,
    rotateBorderVisible: true,
    barVisible: true,
    infoPointVisible: true,
    flyLineVisible: true,
    diffuseVisible: true,
    mapHoverLiftEnabled: true,
    mapHoverLiftHeight: 0.2,
    mapHoverLiftDuration: 0.24,
    cameraControls: {
      enableDamping: true,
      dampingFactor: 0.08,
      minDistance: 22,
      maxDistance: 70,
      maxPolarAngle: Math.PI / 2 - 0.05,
    },
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
    colors: {
      sceneBackground: '#071827',
      chinaBackground: '#102a3c',
      chinaLine: '#2c6983',
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
    provinces: provinceData.map((item) => ({ ...item })),
    infoPoints: infoPointData.map((item) => ({ ...item })),
    mapFocusLabelInfo: {
      name: '陕西省',
      enName: 'SHAANXI PROVINCE',
      center: [108.887114, 31.45],
    },
  }
}
