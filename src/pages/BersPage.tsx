import { useState } from 'react'
import { calculateBers } from '../utils/bers-calculator'
import BackButton from '../components/BackButton'
import { SPACE_TYPES, SPACE_TYPE_CATEGORIES } from '../constants/bers-space-types'
import { BUILDING_CODES } from '../constants/bers-tables'
import type { BersInput, BersResult, ClimateZone, AcMode, SpaceInput } from '../types'

const CLIMATE_ZONES: ClimateZone[] = ['北部', '中部', '南部', '東部', '離島']
const AC_MODES: AcMode[] = ['冷暖', '供冷', '供暖']

const GRADE_LABELS = ['不合格', '合格級', '銅級', '銀級', '黃金級', '鑽石級']
const GRADE_COLORS = ['text-red-500', 'text-gray-500', 'text-amber-600', 'text-slate-500', 'text-yellow-600', 'text-cyan-600']

export default function BersPage() {
  const [input, setInput] = useState<BersInput>({
    projectId: '',
    buildingTypeCode: 'G-1',
    totalFloorArea: 0,
    effectiveFloorArea: 0,
    floorsAbove: 1,
    climateZone: '北部',
    acMode: '冷暖',
    eeRegion: 'A',
    spaces: [],
    hasAutoControl: false,
  })
  const [result, setResult] = useState<BersResult | null>(null)

  function addSpace() {
    setInput(prev => ({
      ...prev,
      spaces: [...prev.spaces, { id: `s-${Date.now()}`, spaceTypeId: 'B3', area: 0 }],
    }))
  }

  function updateSpace(id: string, patch: Partial<SpaceInput>) {
    setInput(prev => ({
      ...prev,
      spaces: prev.spaces.map(s => s.id === id ? { ...s, ...patch } : s),
    }))
  }

  function removeSpace(id: string) {
    setInput(prev => ({ ...prev, spaces: prev.spaces.filter(s => s.id !== id) }))
  }

  function handleCalculate() {
    setResult(calculateBers(input))
  }

  return (
    <div className="p-6 max-w-4xl">
      <BackButton to="/tools" label="返回工具區" />
      <h1 className="text-xl font-semibold text-primary-800 mb-1">BERS 計算 — BERSn 日常節能</h1>
      <p className="text-sm text-primary-400 mb-6">依據台灣綠建築 EEWH 日常節能指標自動計算 EUI* 與評分</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 基本資料 */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-sm col-span-2">
          <h2 className="text-sm font-medium text-primary-600 mb-4">建案基本資料</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-primary-500 mb-1 block">建築用途類別</label>
              <select value={input.buildingTypeCode} onChange={e => setInput(p => ({ ...p, buildingTypeCode: e.target.value }))}
                className="w-full text-sm border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                {BUILDING_CODES.map(b => <option key={b.code} value={b.code}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-primary-500 mb-1 block">有效樓地板面積 AFe (m²)</label>
              <input type="number" value={input.effectiveFloorArea || ''}
                onChange={e => setInput(p => ({ ...p, effectiveFloorArea: +e.target.value }))}
                className="w-full text-sm border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="text-xs text-primary-500 mb-1 block">地上總層數</label>
              <input type="number" value={input.floorsAbove || ''}
                onChange={e => setInput(p => ({ ...p, floorsAbove: +e.target.value }))}
                className="w-full text-sm border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="text-xs text-primary-500 mb-1 block">氣候分區</label>
              <select value={input.climateZone} onChange={e => setInput(p => ({ ...p, climateZone: e.target.value as ClimateZone }))}
                className="w-full text-sm border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                {CLIMATE_ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-primary-500 mb-1 block">空調模式</label>
              <select value={input.acMode} onChange={e => setInput(p => ({ ...p, acMode: e.target.value as AcMode }))}
                className="w-full text-sm border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                {AC_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-primary-600 cursor-pointer">
                <input type="checkbox" checked={input.hasAutoControl}
                  onChange={e => setInput(p => ({ ...p, hasAutoControl: e.target.checked }))}
                  className="accent-primary-500" />
                無須自動控制裝置 (Ep=1)
              </label>
            </div>
          </div>
        </div>

        {/* 空間類型輸入 */}
        <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-primary-600">空間類型與面積</h2>
            <button onClick={addSpace}
              className="text-sm px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
              + 新增空間
            </button>
          </div>
          {input.spaces.length === 0 && (
            <p className="text-sm text-primary-300">請點擊「新增空間」加入空間類型</p>
          )}
          <div className="flex flex-col gap-2">
            {input.spaces.map(sp => {
              const st = SPACE_TYPES.find(s => s.id === sp.spaceTypeId)
              return (
                <div key={sp.id} className="flex gap-3 items-center">
                  <select value={sp.spaceTypeId} onChange={e => updateSpace(sp.id, { spaceTypeId: e.target.value })}
                    className="flex-1 text-xs border border-primary-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {SPACE_TYPE_CATEGORIES.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {SPACE_TYPES.filter(s => s.category === cat).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input type="number" placeholder="面積 m²" value={sp.area || ''}
                      onChange={e => updateSpace(sp.id, { area: +e.target.value })}
                      className="w-28 text-sm border border-primary-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
                    <span className="text-xs text-primary-400">m²</span>
                  </div>
                  {st && <span className="text-xs text-primary-400 w-20">EEUI: {st.EEUI}</span>}
                  <button onClick={() => removeSpace(sp.id)} className="text-red-300 hover:text-red-500 text-lg leading-none">×</button>
                </div>
              )
            })}
          </div>
          <button onClick={handleCalculate}
            disabled={input.spaces.length === 0 || input.effectiveFloorArea <= 0}
            className="mt-4 w-full py-2.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium">
            計算 EUI* 評分
          </button>
        </div>
      </div>

      {/* 計算結果 */}
      {result && (
        <div className="bg-white rounded-xl border border-primary-100 p-6 shadow-sm">
          <h2 className="text-sm font-medium text-primary-600 mb-4">計算結果</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <ScoreCard label="EUI*" value={`${result.EUIstar}`} unit="kWh/(m²·yr)" />
            <ScoreCard label="節能率 ESR" value={`${(result.ESR * 100).toFixed(1)}%`} />
            <ScoreCard label="碳排強度 CEI*" value={`${result.CEIstar}`} unit="kgCO2e/(m²·yr)" />
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-xs text-primary-500 mb-1">日常節能評分</p>
              <p className="text-3xl font-bold text-primary-700">{result.SCOREEE}</p>
              <p className={`text-sm font-medium mt-1 ${GRADE_COLORS[result.grade]}`}>{GRADE_LABELS[result.grade]}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <ParamRow label="AEUIm（空調）" value={`${result.AEUIm} kWh/(m²·yr)`} />
            <ParamRow label="LEUIm（照明）" value={`${result.LEUIm} kWh/(m²·yr)`} />
            <ParamRow label="EEUI（設備）"  value={`${result.EEUI} kWh/(m²·yr)`} />
            <ParamRow label="Es（節電設備係數）" value={result.Es.toString()} />
            <ParamRow label="CF（樓層係數）" value={result.CF.toString()} />
            <ParamRow label="ACe = EAC-EEV×Es" value={result.ACe.toString()} />
            <ParamRow label="EUIn（基準線）"  value={result.EUIn.toString()} />
            <ParamRow label="EUIg（一般基準）" value={result.EUIg.toString()} />
            <ParamRow label="EUImax（最大值）" value={result.EUImax.toString()} />
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-primary-50 rounded-xl p-4 text-center">
      <p className="text-xs text-primary-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-primary-700">{value}</p>
      {unit && <p className="text-xs text-primary-400 mt-0.5">{unit}</p>}
    </div>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 bg-primary-50 rounded-lg">
      <span className="text-primary-600">{label}</span>
      <span className="font-medium text-primary-800">{value}</span>
    </div>
  )
}
