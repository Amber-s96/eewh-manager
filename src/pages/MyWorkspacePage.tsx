import { useEffect, useRef, useState } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import { SEED_USERS } from '../constants/seed-data'
import { EEWH_INDICATORS } from '../constants/indicators'
import type { Task, WorkLog } from '../types'

const STAGES = ['前期評估', '圖說蒐集', '計算檢討', '圖說修改', '產製報告書', '待審查', '候選結案'] as const

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} 分`
  return `${Math.floor(min / 60)} 時 ${min % 60} 分`
}

function isOverdue(dueDate: string, completed: boolean) {
  return !completed && dueDate && new Date(dueDate) < new Date()
}

function groupLogsByDate(logs: WorkLog[]) {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const groups: Record<string, WorkLog[]> = {}
  for (const log of logs) {
    const key = log.date === today ? '今天' : log.date === yesterday ? '昨天' : log.date
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return groups
}

export default function MyWorkspacePage() {
  const { projects, updateTask } = useProjectStore()
  const { currentUserId, setCurrentUserId, workLogs, addWorkLog } = useUserStore()

  const [tab, setTab] = useState<'tasks' | 'journal'>('tasks')

  // timer
  const [timerTaskId, setTimerTaskId] = useState<string | null>(null)
  const [elapsed, setElapsed]         = useState(0)
  const [running, setRunning]         = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [stageFilter, setStageFilter] = useState<string>('全部')

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startTimer = (taskId: string) => {
    if (running) stopTimer(false)
    setTimerTaskId(taskId)
    setElapsed(0)
    setRunning(true)
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }

  const stopTimer = (save = true) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setRunning(false)
    if (save && timerTaskId && elapsed > 0) {
      const proj = projects.find((p) => p.tasks.some((t) => t.id === timerTaskId))
      if (proj) {
        const task = proj.tasks.find((t) => t.id === timerTaskId)
        if (task) {
          const minutes = Math.round(elapsed / 60)
          updateTask(proj.id, timerTaskId, { timeSpent: task.timeSpent + minutes })
          // 記錄工作日誌
          const log: WorkLog = {
            id:          `wl-${Date.now()}`,
            userId:      currentUserId,
            taskId:      timerTaskId,
            taskTitle:   task.title,
            projectId:   proj.id,
            projectName: proj.name,
            date:        new Date().toISOString().slice(0, 10),
            minutes,
          }
          addWorkLog(log)
        }
      }
    }
    if (save) { setElapsed(0); setTimerTaskId(null) }
  }

  // 我的任務
  const myTaskEntries: Array<{ task: Task; projectId: string; projectName: string }> = []
  for (const p of projects) {
    for (const t of p.tasks) {
      if (t.assignees.includes(currentUserId)) {
        myTaskEntries.push({ task: t, projectId: p.id, projectName: p.name })
      }
    }
  }

  const filtered = stageFilter === '全部'
    ? myTaskEntries
    : myTaskEntries.filter((e) => e.task.stage === stageFilter)

  const pending   = filtered.filter((e) => !e.task.completed)
  const completed = filtered.filter((e) => e.task.completed)

  // 雷達圖資料
  const radarData = EEWH_INDICATORS.map((ind) => ({
    subject: ind,
    value: myTaskEntries.filter((e) => e.task.completed && e.task.indicator === ind).length,
  }))

  const totalHours = Math.round(myTaskEntries.reduce((s, e) => s + e.task.timeSpent, 0) / 60 * 10) / 10
  const currentUser = SEED_USERS.find((u) => u.id === currentUserId)

  // 工作日誌（目前使用者）
  const myLogs = workLogs.filter((l) => l.userId === currentUserId)
  const logGroups = groupLogsByDate(myLogs)
  const logTotalMin = myLogs.reduce((s, l) => s + l.minutes, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-800">個人工作區</h1>
          <p className="text-sm text-primary-500 mt-0.5">子任務追蹤、計時器、戰績結算</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary-600">切換使用者：</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="border border-primary-200 rounded-lg px-3 py-1.5 text-sm text-primary-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {SEED_USERS.map((u) => (
              <option key={u.id} value={u.id}>{u.name}（{u.role === 'admin' ? '管理者' : '顧問'}）</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <p className="text-xs text-primary-500 mb-1">指派任務</p>
          <p className="text-2xl font-bold text-primary-700">{myTaskEntries.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <p className="text-xs text-primary-500 mb-1">待完成</p>
          <p className="text-2xl font-bold text-warn">{myTaskEntries.filter((e) => !e.task.completed).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-primary-100 p-4">
          <p className="text-xs text-primary-500 mb-1">累計工時</p>
          <p className="text-2xl font-bold text-primary-700">{totalHours} <span className="text-sm font-normal">小時</span></p>
        </div>
      </div>

      {/* Tab 切換 */}
      <div className="flex gap-1 border-b border-primary-100">
        {([['tasks', '任務清單'], ['journal', '工作日誌']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-primary-400 hover:text-primary-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 任務清單 Tab ── */}
      {tab === 'tasks' && (
        <div className="grid grid-cols-5 gap-6">
          {/* 左側：任務清單 */}
          <div className="col-span-3 space-y-4">
            {/* 階段篩選 */}
            <div className="flex flex-wrap gap-2">
              {['全部', ...STAGES].map((s) => (
                <button
                  key={s}
                  onClick={() => setStageFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    stageFilter === s
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* 待辦 */}
            <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-primary-100 bg-primary-50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-primary-700">待辦任務</h2>
                <span className="text-xs bg-primary-200 text-primary-700 px-2 py-0.5 rounded-full">{pending.length}</span>
              </div>
              {pending.length === 0 ? (
                <p className="text-sm text-primary-400 text-center py-8">無待辦任務 🎉</p>
              ) : (
                <ul className="divide-y divide-primary-50">
                  {pending.map(({ task, projectId, projectName }) => {
                    const overdue = isOverdue(task.dueDate, task.completed)
                    const isTimerTask = timerTaskId === task.id
                    return (
                      <li key={task.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-primary-50 transition-colors ${isTimerTask && running ? 'bg-primary-50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => updateTask(projectId, task.id, { completed: e.target.checked })}
                          className="mt-0.5 w-4 h-4 accent-primary-500 flex-shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-primary-800 font-medium truncate">{task.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-primary-500 truncate">{projectName}</span>
                            <span className="text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">{task.stage}</span>
                            {task.indicator && (
                              <span className="text-xs bg-primary-200 text-primary-700 px-1.5 py-0.5 rounded">{task.indicator}</span>
                            )}
                            {task.dueDate && (
                              <span className={`text-xs ${overdue ? 'text-warn font-medium' : 'text-primary-500'}`}>
                                📅 {task.dueDate}{overdue && ' ⚠️'}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => isTimerTask && running ? stopTimer() : startTimer(task.id)}
                          className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            isTimerTask && running
                              ? 'bg-warn text-white'
                              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                          }`}
                        >
                          {isTimerTask && running ? '停止' : '計時'}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* 已完成 */}
            {completed.length > 0 && (
              <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-primary-100 bg-primary-50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-primary-500">已完成</h2>
                  <span className="text-xs bg-primary-200 text-primary-600 px-2 py-0.5 rounded-full">{completed.length}</span>
                </div>
                <ul className="divide-y divide-primary-50">
                  {completed.map(({ task, projectId, projectName }) => (
                    <li key={task.id} className="px-4 py-3 flex items-start gap-3 opacity-60 hover:opacity-80 transition-opacity">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => updateTask(projectId, task.id, { completed: e.target.checked })}
                        className="mt-0.5 w-4 h-4 accent-primary-500 flex-shrink-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary-600 line-through truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-primary-400 truncate">{projectName}</span>
                          {task.indicator && (
                            <span className="text-xs bg-primary-100 text-primary-500 px-1.5 py-0.5 rounded">{task.indicator}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 右側：計時器 + 雷達圖 */}
          <div className="col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-primary-100 p-5">
              <h2 className="text-sm font-semibold text-primary-700 mb-4">計時器</h2>
              {timerTaskId ? (
                <div className="space-y-3">
                  <p className="text-xs text-primary-500 truncate">
                    {projects.flatMap((p) => p.tasks).find((t) => t.id === timerTaskId)?.title}
                  </p>
                  <div className="text-4xl font-mono font-bold text-primary-700 text-center py-2">
                    {formatTime(elapsed)}
                  </div>
                  <div className="flex gap-2">
                    {running && (
                      <button
                        onClick={() => stopTimer()}
                        className="flex-1 bg-warn text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        停止並儲存
                      </button>
                    )}
                    <button
                      onClick={() => { stopTimer(false); setElapsed(0); setTimerTaskId(null) }}
                      className="flex-1 bg-primary-100 text-primary-600 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="text-4xl font-mono font-bold text-primary-300">00:00:00</div>
                  <p className="text-xs text-primary-400">點擊任務旁的「計時」按鈕開始</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-primary-100 p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-primary-700">戰績結算</h2>
                <span className="text-xs text-primary-400">{currentUser?.name} 指標分佈</span>
              </div>
              <p className="text-xs text-primary-400 mb-3">
                已完成：{myTaskEntries.filter((e) => e.task.completed && e.task.indicator).length} 項指標任務
              </p>
              {radarData.every((d) => d.value === 0) ? (
                <div className="flex items-center justify-center h-40 text-primary-300 text-sm">尚無已完成指標任務</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#c2d9c2" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#4a6a4a' }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, Math.max(3, ...radarData.map((d) => d.value))]}
                      tick={{ fontSize: 10, fill: '#a8c5a8' }}
                      tickCount={4}
                    />
                    <Radar dataKey="value" stroke="#5c7a5c" fill="#5c7a5c" fillOpacity={0.35} strokeWidth={2} />
                    <Tooltip formatter={(v: number) => [`${v} 項`, '完成數']} contentStyle={{ fontSize: 12, borderColor: '#c2d9c2' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 工作日誌 Tab ── */}
      {tab === 'journal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-500">
              {currentUser?.name} 的計時紀錄 — 共 {myLogs.length} 筆，累計 {formatMinutes(logTotalMin)}
            </p>
          </div>

          {myLogs.length === 0 ? (
            <div className="bg-white rounded-xl border border-primary-100 flex flex-col items-center justify-center py-16 text-primary-300">
              <p className="text-3xl mb-2">⏱️</p>
              <p className="text-sm">尚無計時紀錄</p>
              <p className="text-xs mt-1">在任務清單中點擊「計時」開始記錄工時</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(logGroups).map(([dateLabel, logs]) => {
                const dayTotal = logs.reduce((s, l) => s + l.minutes, 0)
                return (
                  <div key={dateLabel} className="bg-white rounded-xl border border-primary-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary-600">{dateLabel}</span>
                      <span className="text-xs text-primary-400">當日合計 {formatMinutes(dayTotal)}</span>
                    </div>
                    <ul className="divide-y divide-primary-50">
                      {logs.map((log) => (
                        <li key={log.id} className="px-4 py-3 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary-700 font-medium truncate">{log.taskTitle}</p>
                            <p className="text-xs text-primary-400 mt-0.5">{log.projectName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-semibold text-primary-600">{formatMinutes(log.minutes)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
