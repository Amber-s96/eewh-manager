import type { BersInput, BersResult, ClimateZone, AcMode } from '../types'
import { SPACE_TYPES } from '../constants/bers-space-types'
import { lookupEs, lookupCf } from '../constants/bers-tables'

function getAEUImi(spaceTypeId: string, zone: ClimateZone, mode: AcMode): number | null {
  const st = SPACE_TYPES.find(s => s.id === spaceTypeId)
  if (!st) return null
  const isNorth = ['北部', '中部'].includes(zone)
  if (isNorth) {
    if (mode === '冷暖') return st.north_coolHeat
    if (mode === '供冷') return st.north_coolOnly
    return st.north_heatOnly
  } else {
    if (mode === '冷暖') return st.south_coolHeat
    if (mode === '供冷') return st.south_coolOnly
    return st.south_heatOnly
  }
}

export function calculateBers(input: BersInput): BersResult {
  const { effectiveFloorArea: AFe, buildingTypeCode, floorsAbove, climateZone, acMode, spaces, hasAutoControl } = input

  // 固定係數
  const EEV = 0.2
  const EAC = 0.8
  const EL = 0.79
  const Ep = hasAutoControl ? 1 : 1  // 無自動控制設備時 Ep=1

  const Es = lookupEs(buildingTypeCode, AFe)
  const CF = lookupCf(buildingTypeCode, floorsAbove)
  // UR 固定為 1（都市地區）；可依地區係數表擴充
  const UR = 1.0

  // 加權平均 EUI
  let sumAEUI = 0, sumLEUI = 0, sumEEUI = 0, totalArea = 0
  for (const sp of spaces) {
    const st = SPACE_TYPES.find(s => s.id === sp.spaceTypeId)
    if (!st || sp.area <= 0) continue
    const AEUImi = getAEUImi(sp.spaceTypeId, climateZone, acMode) ?? 0
    sumAEUI += AEUImi * sp.area
    sumLEUI += st.LEUIm * sp.area
    sumEEUI += st.EEUI * sp.area
    totalArea += sp.area
  }

  const usedArea = AFe > 0 ? AFe : totalArea
  const AEUIm = usedArea > 0 ? sumAEUI / usedArea : 0
  const LEUIm = usedArea > 0 ? sumLEUI / usedArea : 0
  const EEUI  = usedArea > 0 ? sumEEUI / usedArea : 0

  // 核心公式
  const ACe = EAC - EEV * Es
  const EUIstar = UR * (AEUIm * ACe + LEUIm * EL + EEUI * Ep)
  const ESR = (AEUIm + LEUIm) > 0
    ? 1.0 - (AEUIm * ACe + LEUIm * EL) / (AEUIm + LEUIm)
    : 0
  const CEIstar = EUIstar * 0.495

  // 評分基準值
  const EUIn   = UR * (0.5 * AEUIm + 0.5 * LEUIm + EEUI)
  const EUIg   = UR * (0.8 * AEUIm + 0.8 * LEUIm + EEUI)
  const EUImax = UR * (2.0 * AEUIm + 2.0 * LEUIm + EEUI)

  let SCOREEE: number
  if (EUIstar <= EUIg) {
    SCOREEE = (EUIg - EUIn) > 0
      ? 50 + 40 * (EUIg - EUIstar) / (EUIg - EUIn)
      : 50
  } else {
    SCOREEE = (EUImax - EUIg) > 0
      ? 50 * (EUImax - EUIstar) / (EUImax - EUIg)
      : 0
  }
  SCOREEE = Math.max(0, Math.min(100, SCOREEE))

  const grade = SCOREEE >= 90 ? 5
    : SCOREEE >= 80 ? 4
    : SCOREEE >= 70 ? 3
    : SCOREEE >= 60 ? 2
    : SCOREEE >= 50 ? 1
    : 0

  return {
    AEUIm: +AEUIm.toFixed(2),
    LEUIm: +LEUIm.toFixed(2),
    EEUI:  +EEUI.toFixed(2),
    Es, CF, UR, Ep, EL, EEV, EAC,
    ACe:     +ACe.toFixed(3),
    EUIstar: +EUIstar.toFixed(2),
    ESR:     +ESR.toFixed(3),
    CEIstar: +CEIstar.toFixed(2),
    EUIn:    +EUIn.toFixed(2),
    EUIg:    +EUIg.toFixed(2),
    EUImax:  +EUImax.toFixed(2),
    SCOREEE: +SCOREEE.toFixed(1),
    grade,
  }
}
