export type BuildingType = 'BC' | 'RS' | 'GF'
export type GradeType = '合格級' | '銅級' | '銀級' | '黃金級' | '鑽石級'
export type StageType =
  | '前期評估'
  | '圖說蒐集'
  | '計算檢討'
  | '圖說修改'
  | '產製報告書'
  | '待審查'
  | '候選結案'

export type UserRole = 'admin' | 'consultant'
export type ClimateZone = '北部' | '中部' | '南部' | '東部' | '離島'
export type AcMode = '冷暖' | '供冷' | '供暖'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarColor: string
}

export interface Task {
  id: string
  projectId: string
  stage: StageType
  title: string
  assignees: string[]       // user IDs
  dueDate: string
  completed: boolean
  completedAt?: string      // 'YYYY-MM-DD'，完成時自動寫入
  indicator?: string
  notes: string
  timeSpent: number         // 累計分鐘
  createdAt: string
}

export interface Project {
  id: string
  name: string
  type: BuildingType
  grade: GradeType
  stage: StageType
  members: string[]
  contact: string
  address: string
  publicCode: string
  tasks: Task[]
  totalFloorArea: number
  effectiveFloorArea: number
  floorsAbove: number
  floorsBelow: number
  climateZone: ClimateZone
  notes: string
  createdAt: string
  updatedAt: string
}

// BERS 相關型別
export interface SpaceInput {
  id: string
  spaceTypeId: string
  area: number
}

export interface BersInput {
  projectId: string
  buildingTypeCode: string
  totalFloorArea: number
  effectiveFloorArea: number
  floorsAbove: number
  climateZone: ClimateZone
  acMode: AcMode
  eeRegion: string
  spaces: SpaceInput[]
  hasAutoControl: boolean
}

export interface BersResult {
  AEUIm: number
  LEUIm: number
  EEUI: number
  Es: number
  CF: number
  UR: number
  Ep: number
  EL: number
  EEV: number
  EAC: number
  ACe: number
  EUIstar: number
  ESR: number
  CEIstar: number
  EUIn: number
  EUIg: number
  EUImax: number
  SCOREEE: number
  grade: number
}

// 工作日誌
export interface WorkLog {
  id: string
  userId: string
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  date: string      // 'YYYY-MM-DD'
  minutes: number
}
