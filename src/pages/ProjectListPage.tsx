import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import type { Project, StageType, BuildingType, GradeType } from '../types'

const STAGE_COLORS: Record<StageType, string> = {
  '前期評估':  'bg-gray-100 text-gray-600',
  '圖說蒐集':  'bg-blue-100 text-blue-700',
  '計算檢討':  'bg-yellow-100 text-yellow-700',
  '圖說修改':  'bg-orange-100 text-orange-700',
  '產製報告書': 'bg-purple-100 text-purple-700',
  '待審查':    'bg-primary-100 text-primary-700',
  '候選結案':  'bg-green-100 text-green-700',
}

const GRADE_COLORS: Record<GradeType, string> = {
  '合格級': 'bg-gray-200 text-gray-700',
  '銅級':   'bg-amber-100 text-amber-700',
  '銀級':   'bg-slate-200 text-slate-700',
  '黃金級': 'bg-yellow-100 text-yellow-700',
  '鑽石級': 'bg-cyan-100 text-cyan-700',
}

const TYPE_LABEL: Record<BuildingType, string> = {
  BC: 'BC 基本型',
  RS: 'RS 住宿類',
  GF: 'GF 廠房',
}

const STAGES: StageType[] = ['前期評估','圖說蒐集','計算檢討','圖說修改','產製報告書','待審查','候選結案']

function BoardView({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map(stage => {
        const cols = projects.filter(p => p.stage === stage)
        return (
          <div key={stage} className="min-w-[200px] flex-shrink-0">
            <div className={`text-xs font-semibold px-3 py-1.5 rounded-t-lg ${STAGE_COLORS[stage]}`}>
              {stage} ({cols.length})
            </div>
            <div className="bg-primary-50 rounded-b-lg p-2 flex flex-col gap-2 min-h-[120px]">
              {cols.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/project/${p.id}`)}
                  className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-primary-100"
                >
                  <p className="text-sm font-medium text-primary-800 leading-tight mb-2">{p.name}</p>
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 text-primary-600">{TYPE_LABEL[p.type]}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${GRADE_COLORS[p.grade]}`}>{p.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()
  return (
    <div className="overflow-x-auto rounded-xl border border-primary-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary-100 bg-primary-50">
            <th className="text-left px-4 py-3 font-medium text-primary-700">建案名稱</th>
            <th className="text-left px-4 py-3 font-medium text-primary-700">類型</th>
            <th className="text-left px-4 py-3 font-medium text-primary-700">等級</th>
            <th className="text-left px-4 py-3 font-medium text-primary-700">進行階段</th>
            <th className="text-left px-4 py-3 font-medium text-primary-700">聯絡窗口</th>
            <th className="text-left px-4 py-3 font-medium text-primary-700">更新日期</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr
              key={p.id}
              onClick={() => navigate(`/project/${p.id}`)}
              className="border-b border-primary-50 hover:bg-primary-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-medium text-primary-800">{p.name}</td>
              <td className="px-4 py-3 text-primary-600">{TYPE_LABEL[p.type]}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${GRADE_COLORS[p.grade]}`}>{p.grade}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[p.stage]}`}>{p.stage}</span>
              </td>
              <td className="px-4 py-3 text-primary-600">{p.contact}</td>
              <td className="px-4 py-3 text-primary-400 text-xs">{p.updatedAt.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ProjectListPage() {
  const projects = useProjectStore(s => s.projects)
  const [view, setView] = useState<'board' | 'table'>('table')
  const [filterStage, setFilterStage] = useState<string>('全部')
  const [filterType, setFilterType] = useState<string>('全部')

  const filtered = projects.filter(p =>
    (filterStage === '全部' || p.stage === filterStage) &&
    (filterType  === '全部' || p.type  === filterType)
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-primary-800">案件總覽</h1>
          <p className="text-sm text-primary-400 mt-0.5">共 {projects.length} 個案件</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 篩選 */}
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="text-sm border border-primary-200 rounded-lg px-3 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option>全部</option>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-sm border border-primary-200 rounded-lg px-3 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option>全部</option>
            <option value="BC">BC 基本型</option>
            <option value="RS">RS 住宿類</option>
            <option value="GF">GF 廠房</option>
          </select>
          {/* 切換 View */}
          <div className="flex rounded-lg border border-primary-200 overflow-hidden">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'table' ? 'bg-primary-500 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
            >
              表格
            </button>
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'board' ? 'bg-primary-500 text-white' : 'bg-white text-primary-600 hover:bg-primary-50'}`}
            >
              看板
            </button>
          </div>
        </div>
      </div>

      {view === 'board' ? <BoardView projects={filtered} /> : <TableView projects={filtered} />}
    </div>
  )
}
