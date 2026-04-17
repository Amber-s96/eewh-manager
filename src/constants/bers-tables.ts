// UR 地區係數（來源：UR地區係數工作表）
export const UR_GRADES: Record<string, number> = {
  A: 1.0,
  B: 0.95,
  C: 0.8,
  D: 0.7,
}

// Es 查找表（建築用途類別 × 有效樓地板面積 → Es）
interface EsRule { buildingCode: string; maxArea: number; es: number }

export const ES_TABLE: EsRule[] = [
  { buildingCode: 'A-1', maxArea: 5000,  es: 0.04 },
  { buildingCode: 'A-1', maxArea: 20000, es: 0.03 },
  { buildingCode: 'A-1', maxArea: 40000, es: 0.02 },
  { buildingCode: 'A-1', maxArea: Infinity, es: 0.01 },
  { buildingCode: 'B-1', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'B-1', maxArea: 20000, es: 0.06 },
  { buildingCode: 'B-1', maxArea: 40000, es: 0.05 },
  { buildingCode: 'B-1', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'B-2', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'B-2', maxArea: 20000, es: 0.06 },
  { buildingCode: 'B-2', maxArea: 40000, es: 0.05 },
  { buildingCode: 'B-2', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'B-3', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'B-3', maxArea: 20000, es: 0.06 },
  { buildingCode: 'B-3', maxArea: 40000, es: 0.05 },
  { buildingCode: 'B-3', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'B-4', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'B-4', maxArea: 20000, es: 0.06 },
  { buildingCode: 'B-4', maxArea: 40000, es: 0.05 },
  { buildingCode: 'B-4', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'D-1', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'D-1', maxArea: 20000, es: 0.06 },
  { buildingCode: 'D-1', maxArea: 40000, es: 0.05 },
  { buildingCode: 'D-1', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'D-2', maxArea: 5000,  es: 0.12 },
  { buildingCode: 'D-2', maxArea: 20000, es: 0.10 },
  { buildingCode: 'D-2', maxArea: 40000, es: 0.08 },
  { buildingCode: 'D-2', maxArea: Infinity, es: 0.06 },
  { buildingCode: 'F-1', maxArea: 5000,  es: 0.07 },
  { buildingCode: 'F-1', maxArea: 20000, es: 0.06 },
  { buildingCode: 'F-1', maxArea: 40000, es: 0.05 },
  { buildingCode: 'F-1', maxArea: Infinity, es: 0.04 },
  { buildingCode: 'G-1', maxArea: 5000,  es: 0.12 },
  { buildingCode: 'G-1', maxArea: 20000, es: 0.10 },
  { buildingCode: 'G-1', maxArea: 40000, es: 0.08 },
  { buildingCode: 'G-1', maxArea: Infinity, es: 0.06 },
  { buildingCode: 'G-2', maxArea: 5000,  es: 0.12 },
  { buildingCode: 'G-2', maxArea: 20000, es: 0.10 },
  { buildingCode: 'G-2', maxArea: 40000, es: 0.08 },
  { buildingCode: 'G-2', maxArea: Infinity, es: 0.06 },
  { buildingCode: 'H1/H-2', maxArea: Infinity, es: 0.12 },
]

// CF 查找表（建築用途類別 × 地上樓層數 → CF）
interface CfRule { buildingCode: string; maxFloors: number; cf: number }

export const CF_TABLE: CfRule[] = [
  { buildingCode: 'A-1',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'A-1',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'A-1',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'B-1',    maxFloors: 7,  cf: 0.75 },
  { buildingCode: 'B-1',    maxFloors: 15, cf: 0.70 },
  { buildingCode: 'B-1',    maxFloors: Infinity, cf: 0.65 },
  { buildingCode: 'B-2',    maxFloors: 7,  cf: 0.75 },
  { buildingCode: 'B-2',    maxFloors: 15, cf: 0.70 },
  { buildingCode: 'B-2',    maxFloors: Infinity, cf: 0.65 },
  { buildingCode: 'B-3',    maxFloors: 7,  cf: 0.75 },
  { buildingCode: 'B-3',    maxFloors: 15, cf: 0.70 },
  { buildingCode: 'B-3',    maxFloors: Infinity, cf: 0.65 },
  { buildingCode: 'B-4',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'B-4',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'B-4',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'D-1',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'D-1',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'D-1',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'D-2',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'D-2',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'D-2',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'F-1',    maxFloors: 7,  cf: 0.75 },
  { buildingCode: 'F-1',    maxFloors: 15, cf: 0.70 },
  { buildingCode: 'F-1',    maxFloors: Infinity, cf: 0.65 },
  { buildingCode: 'G-1',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'G-1',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'G-1',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'G-2',    maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'G-2',    maxFloors: 15, cf: 0.75 },
  { buildingCode: 'G-2',    maxFloors: Infinity, cf: 0.70 },
  { buildingCode: 'H1/H-2', maxFloors: 7,  cf: 0.80 },
  { buildingCode: 'H1/H-2', maxFloors: 15, cf: 0.75 },
  { buildingCode: 'H1/H-2', maxFloors: Infinity, cf: 0.70 },
]

export function lookupEs(buildingCode: string, area: number): number {
  const rules = ES_TABLE.filter(r => r.buildingCode === buildingCode)
  const rule = rules.find(r => area < r.maxArea) ?? rules[rules.length - 1]
  return rule?.es ?? 0.04
}

export function lookupCf(buildingCode: string, floors: number): number {
  const rules = CF_TABLE.filter(r => r.buildingCode === buildingCode)
  const rule = rules.find(r => floors <= r.maxFloors) ?? rules[rules.length - 1]
  return rule?.cf ?? 0.75
}

export const BUILDING_CODES = [
  { code: 'A-1', label: 'A-1 集合住宅' },
  { code: 'B-1', label: 'B-1 百貨商場' },
  { code: 'B-2', label: 'B-2 零售量販' },
  { code: 'B-3', label: 'B-3 休閒娛樂' },
  { code: 'B-4', label: 'B-4 旅館' },
  { code: 'D-1', label: 'D-1 學校類' },
  { code: 'D-2', label: 'D-2 教學設施' },
  { code: 'F-1', label: 'F-1 醫療作業' },
  { code: 'G-1', label: 'G-1 辦公廳舍' },
  { code: 'G-2', label: 'G-2 金融辦公' },
  { code: 'H1/H-2', label: 'H1/H-2 BERS適用類' },
]
