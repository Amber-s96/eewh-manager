import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import type { Project } from '../types'

const STAGE_ORDER = ['前期評估', '圖說蒐集', '計算檢討', '圖說修改', '產製報告書', '待審查', '候選結案'] as const

function StageProgress({ stage }: { stage: string }) {
  const idx = STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number])
  return (
    <div className="flex items-center gap-1 flex-wrap mt-3">
      {STAGE_ORDER.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              i < idx
                ? 'bg-primary-300 text-white'
                : i === idx
                ? 'bg-primary-600 text-white'
                : 'bg-primary-100 text-primary-400'
            }`}
          >
            {s}
          </div>
          {i < STAGE_ORDER.length - 1 && (
            <span className={`text-xs ${i < idx ? 'text-primary-400' : 'text-primary-200'}`}>›</span>
          )}
        </div>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const totalTasks     = project.tasks.length
  const completedTasks = project.tasks.filter((t) => t.completed).length
  const progress       = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const latestDue      = project.tasks
    .filter((t) => t.dueDate && !t.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate

  return (
    <div className="bg-white rounded-2xl border border-primary-200 p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
              {project.type}
            </span>
            <span className="text-xs bg-primary-200 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {project.grade}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-primary-800">{project.name}</h2>
          <p className="text-sm text-primary-500 mt-0.5">{project.address}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-primary-400">案件代碼</p>
          <p className="text-sm font-mono text-primary-600">{project.publicCode}</p>
        </div>
      </div>

      {/* Stage progress */}
      <div className="mt-4">
        <p className="text-xs text-primary-500 mb-1">目前進行階段</p>
        <StageProgress stage={project.stage} />
      </div>

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-primary-500 mb-1">
            <span>子任務完成進度</span>
            <span>{completedTasks} / {totalTasks} ({progress}%)</span>
          </div>
          <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-4 pt-4 border-t border-primary-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-primary-400">聯絡窗口</p>
          <p className="text-primary-700 font-medium mt-0.5">{project.contact || '—'}</p>
        </div>
        {latestDue && (
          <div>
            <p className="text-primary-400">最近截止日</p>
            <p className="text-primary-700 font-medium mt-0.5">{latestDue}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicQueryPage() {
  const { projects } = useProjectStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode]       = useState(searchParams.get('code') ?? '')
  const [searched, setSearched] = useState(!!searchParams.get('code'))
  const [result, setResult]   = useState<Project | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const c = searchParams.get('code')
    if (c) { handleSearch(c) }
  }, [])

  const handleSearch = (query?: string) => {
    const q = (query ?? code).trim().toUpperCase()
    if (!q) return
    const found = projects.find((p) => p.publicCode.toUpperCase() === q)
    setResult(found ?? null)
    setNotFound(!found)
    setSearched(true)
    setSearchParams(q ? { code: q } : {})
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center py-16 px-4">
      {/* Logo / Title */}
      <div className="text-center mb-10">
        <span className="text-4xl">🌿</span>
        <h1 className="text-2xl font-semibold text-primary-700 mt-2">綠建築專案進度查詢</h1>
        <p className="text-sm text-primary-400 mt-1">輸入案件代碼以查詢目前進行狀況</p>
      </div>

      {/* Search box */}
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="例：EEWH-2024-001"
            className="flex-1 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-800 placeholder-primary-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 font-mono"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            查詢
          </button>
        </div>

        {/* Quick hints */}
        <div className="mt-3 flex flex-wrap gap-2">
          {['EEWH-2024-001', 'EEWH-2024-002', 'EEWH-2024-003'].map((c) => (
            <button
              key={c}
              onClick={() => { setCode(c); handleSearch(c) }}
              className="text-xs text-primary-400 hover:text-primary-600 underline underline-offset-2 font-mono transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="w-full max-w-2xl mt-10">
        {searched && notFound && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-primary-600 font-medium">找不到案件代碼「{code}」</p>
            <p className="text-sm text-primary-400 mt-1">請確認代碼是否正確，或聯絡承辦顧問</p>
          </div>
        )}
        {result && <ProjectCard project={result} />}
      </div>

      <p className="mt-16 text-xs text-primary-300">© EEWH Manager — 綠建築專案管理系統</p>
    </div>
  )
}
