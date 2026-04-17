import type { StageType } from '../types'

export interface TaskTemplate {
  title: string
  stage: StageType
  indicator?: string
  notes?: string
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // 綠化
  { title: '基地綠化面積計算',     stage: '計算檢討', indicator: '綠化',      notes: '依 EEWH 計算基準計算綠化量 GRc' },
  { title: '喬木種植位置確認',     stage: '圖說修改', indicator: '綠化' },
  // 保水
  { title: '保水設施圖說蒐集',     stage: '圖說蒐集', indicator: '保水' },
  { title: '透水鋪面面積計算',     stage: '計算檢討', indicator: '保水',      notes: '計算透水鋪面佔基地面積比例' },
  // 水資源
  { title: '雨水回收系統設計確認', stage: '圖說修改', indicator: '水資源' },
  { title: '節水設備計算',         stage: '計算檢討', indicator: '水資源',    notes: '節水率計算，包含馬桶/水龍頭規格確認' },
  // 日常節能
  { title: 'BERSn 日常節能計算',   stage: '計算檢討', indicator: '日常節能',  notes: '依 BERSn 計算引擎輸入空間類型與面積' },
  { title: '外遮陽設施確認',       stage: '圖說修改', indicator: '日常節能' },
  // CO2減量
  { title: 'CO2 減量指標評估',     stage: '計算檢討', indicator: 'CO2減量',   notes: '結構體 CO2 排放量計算' },
  { title: '輕量化結構確認',       stage: '圖說蒐集', indicator: 'CO2減量' },
  // 廢棄物減量
  { title: '施工廢棄物減量計畫',   stage: '前期評估', indicator: '廢棄物減量', notes: '估算廢棄物總量，擬定減量策略' },
  { title: '資源化再生材料確認',   stage: '圖說修改', indicator: '廢棄物減量' },
  // 室內環境
  { title: '室內空氣品質確認',     stage: '圖說修改', indicator: '室內環境',  notes: '確認通風換氣量符合指標要求' },
  { title: '日照採光計算',         stage: '計算檢討', indicator: '室內環境' },
  // 垃圾處理
  { title: '垃圾處理設施位置確認', stage: '圖說蒐集', indicator: '垃圾處理' },
  { title: '資源回收空間設計',     stage: '圖說修改', indicator: '垃圾處理' },
  // 生物多樣性
  { title: '生態池/棲地規劃評估',  stage: '前期評估', indicator: '生物多樣性' },
  { title: '生物多樣性評估報告',   stage: '計算檢討', indicator: '生物多樣性' },
  // 一般行政
  { title: '蒐集建築/結構圖說',    stage: '圖說蒐集' },
  { title: '圖說修改後確認',       stage: '圖說修改' },
  { title: '撰寫候選證書申請書',   stage: '產製報告書', notes: '依內政部最新格式撰寫' },
  { title: '送件審查前自主確認',   stage: '待審查',   notes: '依申請表逐項勾選確認' },
]

export const TEMPLATE_GROUPS = [
  { label: '綠化',      icon: '🌿', keys: ['基地綠化', '喬木'] },
  { label: '保水',      icon: '💧', keys: ['保水', '透水'] },
  { label: '水資源',    icon: '🚿', keys: ['雨水', '節水'] },
  { label: '日常節能',  icon: '⚡', keys: ['BERSn', '外遮陽'] },
  { label: 'CO2減量',   icon: '♻️', keys: ['CO2', '輕量化'] },
  { label: '廢棄物',    icon: '🗑️', keys: ['廢棄物', '資源化'] },
  { label: '室內環境',  icon: '🏠', keys: ['室內', '日照'] },
  { label: '垃圾處理',  icon: '📦', keys: ['垃圾', '回收空間'] },
  { label: '生物多樣性',icon: '🦋', keys: ['生態', '生物多樣'] },
  { label: '行政作業',  icon: '📋', keys: ['圖說', '候選', '審查'] },
]
