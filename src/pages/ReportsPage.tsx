import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts'
import { useProjectStore } from '../store/projectStore'
import ProjectStageGantt from '../components/ProjectStageGantt'
import type { Project } from '../types'

const STAGES = ['前期評估', '圖說蒐集', '計算檢討', '圖說修改', '產製報告書', '待審查', '候選結案'] as const

const STAGE_COLORS: Record<string, string> = {
  '前期評估':   '#e0ece0',
  '圖說蒐集':   '#c2d9c2',
  '計算檢討':   '#a8c5a8',
  '圖說修改':   '#8faf8f',
  '產製報告書': '#5c7a5c',
  '待審查':     '#4a6a4a',
  '候選結案':   '#2c3a2c',
}

const GRADE_BADGE: Record<string, string> = {
  '合格級': 'bg-gray-100 text-gray-600',
  '銅級':   'bg-amber-100 text-amber-700',
  '銀級':   'bg-slate-200 text-slate-700',
  '黃金級': 'bg-yellow-100 text-yellow-700',
  '鑽石級': 'bg-cyan-100 text-cyan-700',
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1   // 週一為起點
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMonthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function projectStats(p: Project) {
  const weekStart  = getWeekStart()
  const monthStart = getMonthStart()
  const allTasks   = p.tasks
  const total      = allTasks.length
  const done       = allTasks.filter(t => t.completed).length
  const weekDone   = allTasks.filter(t => t.completedAt && new Date(t.completedAt) >= weekStart).length
  const monthDone  = allTasks.filter(t => t.completedAt && new Date(t.completedAt) >= monthStart).length
  const pct        = total > 0 ? Math.round(done / total * 100) : 0
  return { total, done, pct, weekDone, monthDone }
}

export default function ReportsPage() {
  const { projects } = useProjectStore()

  // 整體統計
  const allTasks   = projects.flatMap(p => p.tasks)
  const weekStart  = getWeekStart()
  const monthStart = getMonthStart()
  const weekTotal  = allTasks.filter(t => t.completedAt && new Date(t.completedAt) >= weekStart).length
  const monthTotal = allTasks.filter(t => t.completedAt && new Date(t.completedAt) >= monthStart).length
  const totalDone  = allTasks.filter(t => t.completed).length

  // 階段分佈（圓餅圖）
  const stageData = STAGES
    .map(s => ({ name: s, value: projects.filter(p => p.stage === s).length }))
    .filter(d => d.value > 0)

  // 每個專案本週完成 bar chart
  const projectWeekData = projects.map(p => {
    const { weekDone, monthDone, pct } = projectStats(p)
    return { name: p.name.slice(0, 6), 本週: weekDone, 本月: monthDone, 完成率: pct }
  })

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-800">報表區</h1>
        <p className="text-sm text-primary-500 mt-0.5">以專案為主軸的進度報告</p>
      </div>

      {/* 全局摘要卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-primary-100 p-5">
          <p className="text-xs text-primary-500 mb-1">本週完成子任務</p>
          <p className="text-3xl font-bold text-primary-700">{weekTotal}</p>
          <p className="text-xs text-primary-400 mt-1">本週（週一起）</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-5">
          <p className="text-xs text-primary-500 mb-1">本月完成子任務</p>
          <p className="text-3xl font-bold text-primary-700">{monthTotal}</p>
          <p className="text-xs text-primary-400 mt-1">本月份累計</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-5">
          <p className="text-xs text-primary-500 mb-1">整體完成率</p>
          <p className="text-3xl font-bold text-primary-700">
            {allTasks.length > 0 ? Math.round(totalDone / allTasks.length * 100) : 0}
            <span className="text-lg font-normal">%</span>
          </p>
          <p className="text-xs text-primary-400 mt-1">{totalDone} / {allTasks.length} 項</p>
        </div>
      </div>

      {/* 專案完成度列表 */}
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="px-5 py-3 bg-primary-50 border-b border-primary-100">
          <h2 className="text-sm font-semibold text-primary-700">各專案進度總覽</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-xs text-primary-500">
                <th className="text-left px-5 py-2.5 font-medium">建案名稱</th>
                <th className="text-left px-3 py-2.5 font-medium">等級</th>
                <th className="text-left px-3 py-2.5 font-medium">目前階段</th>
                <th className="text-center px-3 py-2.5 font-medium">本週完成</th>
                <th className="text-center px-3 py-2.5 font-medium">本月完成</th>
                <th className="text-left px-3 py-2.5 font-medium">整體進度</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const { total, done, pct, weekDone, monthDone } = projectStats(p)
                return (
                  <tr key={p.id} className="border-b border-primary-50 hover:bg-primary-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary-800">{p.name}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${GRADE_BADGE[p.grade]}`}>{p.grade}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">{p.stage}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-semibold ${weekDone > 0 ? 'text-primary-600' : 'text-primary-300'}`}>
                        {weekDone}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-sm font-semibold ${monthDone > 0 ? 'text-primary-600' : 'text-primary-300'}`}>
                        {monthDone}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {total > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-primary-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary-500 whitespace-nowrap w-14 text-right">
                            {done}/{total} ({pct}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-primary-300">無子任務</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 圖表列 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 階段分佈圓餅圖 */}
        <div className="bg-white rounded-xl border border-primary-100 p-5">
          <h2 className="text-sm font-semibold text-primary-700 mb-4">各階段案件分佈</h2>
          {stageData.length === 0 ? (
            <p className="text-sm text-primary-400 text-center py-10">無資料</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stageData.map((entry) => (
                    <Cell key={entry.name} fill={STAGE_COLORS[entry.name] ?? '#a8c5a8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} 件`, '案件數']} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 各專案本週/本月完成柱圖 */}
        <div className="bg-white rounded-xl border border-primary-100 p-5">
          <h2 className="text-sm font-semibold text-primary-700 mb-4">各專案完成子任務數</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectWeekData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0ece0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a6a4a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8faf8f' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderColor: '#c2d9c2' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="本週" fill="#5c7a5c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="本月" fill="#a8c5a8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 甘特圖：以專案階段為分段 */}
      <div className="bg-white rounded-xl border border-primary-100 p-5">
        <h2 className="text-sm font-semibold text-primary-700 mb-1">專案進度甘特圖</h2>
        <p className="text-xs text-primary-400 mb-4">以子任務日期範圍呈現各專案階段時間軸</p>
        <ProjectStageGantt projects={projects} />
      </div>
    </div>
  )
}
