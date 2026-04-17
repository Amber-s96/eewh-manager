export const EEWH_INDICATORS = [
  '綠化',
  '保水',
  '水資源',
  '日常節能',
  'CO2減量',
  '廢棄物減量',
  '室內環境',
  '垃圾處理',
  '生物多樣性',
] as const

export type EEWHIndicator = typeof EEWH_INDICATORS[number]
