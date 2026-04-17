// 空間類型參考表（來源：BERSn計算.xlsx → 空間類型工作表）
// 欄位：EEUI, LEUIm(北冷暖/北供冷/北供暖), AEUIm(南冷暖/南供冷/南供暖)

export interface SpaceTypeRecord {
  id: string
  category: string
  name: string
  EEUI: number
  LEUIm: number
  // 北部 AEUIm
  north_coolHeat: number | null
  north_coolOnly: number | null
  north_heatOnly: number | null
  // 南部 AEUIm
  south_coolHeat: number | null
  south_coolOnly: number | null
  south_heatOnly: number | null
}

export const SPACE_TYPES: SpaceTypeRecord[] = [
  // A. BERS 適用類
  { id: 'A1', category: 'A.BERS適用類', name: 'A1.小型一般住宅及集合住宅(H-1、H-2)', EEUI: 10.03, LEUIm: 21.11, north_coolHeat: 53.66, north_coolOnly: 59.7, north_heatOnly: 68.04, south_coolHeat: 36.99, south_coolOnly: 44.9, south_heatOnly: 50.43 },
  { id: 'A2', category: 'A.BERS適用類', name: 'A2.小型複合住宅、旅館(H-1、H-2)', EEUI: 16.76, LEUIm: 26.51, north_coolHeat: 36.57, north_coolOnly: 42.5, north_heatOnly: 49.44, south_coolHeat: 26.08, south_coolOnly: 32.15, south_heatOnly: 35.87 },
  { id: 'A3', category: 'A.BERS適用類', name: 'A3.寢室及自用寢室', EEUI: 12.27, LEUIm: 49.96, north_coolHeat: null, north_coolOnly: null, north_heatOnly: null, south_coolHeat: 37.62, south_coolOnly: 45.85, south_heatOnly: 50.87 },
  { id: 'A4', category: 'A.BERS適用類', name: 'A4.學生宿舍(含有宿舍功能的學校建物)', EEUI: 12.41, LEUIm: 40.1, north_coolHeat: null, north_coolOnly: null, north_heatOnly: null, south_coolHeat: 47.1, south_coolOnly: 68.6, south_heatOnly: 80.1 },
  { id: 'A5', category: 'A.BERS適用類', name: 'A5.出租宿舍及套房', EEUI: 5.6, LEUIm: 13.98, north_coolHeat: null, north_coolOnly: null, north_heatOnly: null, south_coolHeat: 37.86, south_coolOnly: 41.2, south_heatOnly: 53.59 },
  // B. 辦公室類大廳
  { id: 'B1', category: 'B.辦公室類大廳', name: 'B1.辦公室大廳(含主要大廳室、中庭廊道、大型商場及大型餐廳等大廳)', EEUI: 39.94, LEUIm: 38.51, north_coolHeat: 64.72, north_coolOnly: 70.01, north_heatOnly: 79.96, south_coolHeat: 49.66, south_coolOnly: 53.46, south_heatOnly: 69.76 },
  { id: 'B2', category: 'B.辦公室類大廳', name: 'B2.辦公室大廳專用大廳及專用大廳區域空調廊道', EEUI: 1.65, LEUIm: 21.03, north_coolHeat: 19.05, north_coolOnly: 22.5, north_heatOnly: 23.9, south_coolHeat: 14.42, south_coolOnly: 16.84, south_heatOnly: 20.72 },
  { id: 'B3', category: 'B.辦公室類大廳', name: 'B3.一般辦公大廳(一般辦公、公務辦公、複合辦公)', EEUI: 16.93, LEUIm: 31.61, north_coolHeat: 46.29, north_coolOnly: 52.85, north_heatOnly: 56.55, south_coolHeat: 34.27, south_coolOnly: 38.43, south_heatOnly: 48.1 },
  { id: 'B4', category: 'B.辦公室類大廳', name: 'B4.一般辦公大廳專用大廳及專用大廳區域空調廊道', EEUI: 1.83, LEUIm: 24, north_coolHeat: 26.36, north_coolOnly: 28.38, north_heatOnly: 31.37, south_coolHeat: 20.42, south_coolOnly: 22.04, south_heatOnly: 27.63 },
  // C. 空調設備
  { id: 'C1', category: 'C.空調設備(含水冷式、氣冷式)', name: 'C1.中央空調設備及建築總空調設備/冷卻水塔', EEUI: 17.31, LEUIm: 36.57, north_coolHeat: 47.09, north_coolOnly: 50.2, north_heatOnly: 55.4, south_coolHeat: 34.36, south_coolOnly: 36.99, south_heatOnly: 47.54 },
  { id: 'C2', category: 'C.空調設備(含水冷式、氣冷式)', name: 'C2.中央空調設備及建築總空調設備/大廈(含冷熱運轉及落地)', EEUI: 2.82, LEUIm: 32.61, north_coolHeat: 29.29, north_coolOnly: 31.25, north_heatOnly: 33.77, south_coolHeat: 21.45, south_coolOnly: 23.31, south_heatOnly: 29.31 },
  { id: 'C3', category: 'C.空調設備(含水冷式、氣冷式)', name: 'C3.中央空調設備及建築總空調設備/大廈/建築總空調設備辦公廊道', EEUI: 24.92, LEUIm: 27.49, north_coolHeat: 35.18, north_coolOnly: 36.75, north_heatOnly: 41.96, south_coolHeat: 26.56, south_coolOnly: 27.99, south_heatOnly: 36.39 },
  { id: 'C7', category: 'C.空調設備(含水冷式、氣冷式)', name: 'C7.大型建築總空調設備/冷卻水塔', EEUI: 16.89, LEUIm: 42.25, north_coolHeat: 48.36, north_coolOnly: 52.84, north_heatOnly: 57.94, south_coolHeat: 34.56, south_coolOnly: 38.46, south_heatOnly: 50.06 },
  { id: 'C8', category: 'C.空調設備(含水冷式、氣冷式)', name: 'C8.大型建築總空調設備/大廈(含冷熱運轉及落地)', EEUI: 2.75, LEUIm: 37.67, north_coolHeat: 30.67, north_coolOnly: 33.03, north_heatOnly: 35.79, south_coolHeat: 21.97, south_coolOnly: 24.35, south_heatOnly: 31.23 },
  // D. 廚房
  { id: 'D1', category: 'D.廚房(烹飪設備、煤氣設備、煤氣中控管制、含水冷式)', name: 'D1.A型廚房空調廚房', EEUI: 38.1, LEUIm: 21.58, north_coolHeat: 154.86, north_coolOnly: 152.22, north_heatOnly: 162.6, south_coolHeat: null, south_coolOnly: null, south_heatOnly: null },
  { id: 'D2', category: 'D.廚房(烹飪設備、煤氣設備、煤氣中控管制、含水冷式)', name: 'D2.B型廚房空調廚房', EEUI: 13.23, LEUIm: 21.97, north_coolHeat: 96.24, north_coolOnly: 98.11, north_heatOnly: 105.05, south_coolHeat: null, south_coolOnly: null, south_heatOnly: null },
  // H. 電梯
  { id: 'H1', category: 'H.電梯(升降、電扶梯、電梯廂及無機房)', name: 'H1.電梯設備計算', EEUI: 10.91, LEUIm: 25.93, north_coolHeat: 74.17, north_coolOnly: 77.9, north_heatOnly: 83.97, south_coolHeat: null, south_coolOnly: null, south_heatOnly: null },
  { id: 'H2', category: 'H.電梯(升降、電扶梯、電梯廂及無機房)', name: 'H2.電梯設備計算(使用舊版試算表)', EEUI: 10.91, LEUIm: 25.93, north_coolHeat: 80.46, north_coolOnly: 80.89, north_heatOnly: 84.75, south_coolHeat: null, south_coolOnly: null, south_heatOnly: null },
]

export const SPACE_TYPE_CATEGORIES = [...new Set(SPACE_TYPES.map(s => s.category))]
