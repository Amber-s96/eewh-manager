import { differenceInDays, eachMonthOfInterval, format, startOfMonth, addDays } from 'date-fns'
import type { Project, StageType } from '../types'

const STAGES: StageType[] = ['前期評估', '圖說蒐集', '計算檢討', '圖說修改', '產製報告書', '待審查', '候選結案']
const LABEL_WIDTH = 200

const STAGE_COLOR: Record<string, { bar: string; text: string }> = {
  past:    { bar: 'bg-primary-300', text: 'text-white' },
  current: { bar: 'bg-primary-600', text: 'text-white' },
  future:  { bar: 'bg-primary-100', text: 'text-primary-400' },
}

interface Props { projects: Project[] }

export default function ProjectStageGantt({ projects }: Props) {
  // 計算時間軸範圍
  const allDates: Date[] = projects.flatMap((p) => [
    new Date(p.createdAt),
    ...p.tasks.filter((t) => t.dueDate).map((t) => new Date(t.dueDate)),
  ])

  if (allDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-primary-400 text-sm">
        尚無案件資料
      </div>
    )
  }

  const rawStart = new Date(Math.min(...allDates.map((d) => d.getTime())))
  const rawEnd   = new Date(Math.max(...allDates.map((d) => d.getTime())))
  const startDate = startOfMonth(rawStart)
  const endDate   = addDays(rawEnd, 21)
  const totalDays = Math.max(differenceInDays(endDate, startDate), 1)

  const pct = (date: Date) =>
    Math.max(0, Math.min(100, (differenceInDays(date, startDate) / totalDays) * 100))

  const months = eachMonthOfInterval({ start: startDate, end: endDate })
  const today  = new Date()
  const todayPct = pct(today)

  return (
    <div className="overflow-x-auto rounded border border-primary-100">
      <div style={{ minWidth: 860 }}>
        {/* 時間軸 header */}
        <div className="flex" style={{ height: 32 }}>
          <div
            className="flex-shrink-0 bg-primary-100 border-b border-r border-primary-200 flex items-center px-3 text-xs font-medium text-primary-600"
            style={{ width: LABEL_WIDTH }}
          >
            專案 / 階段
          </div>
          <div className="flex-1 relative bg-primary-50 border-b border-primary-100">
            {months.map((m) => (
              <div
                key={m.toISOString()}
                className="absolute top-0 h-full border-l border-primary-200 flex items-center"
                style={{ left: `${pct(m)}%` }}
              >
                <span className="text-[11px] text-primary-500 pl-1 select-none">{format(m, 'yyyy/M')}</span>
              </div>
            ))}
            {todayPct >= 0 && todayPct <= 100 && (
              <div
                className="absolute top-0 h-full border-l-2 border-primary-500 z-10"
                style={{ left: `${todayPct}%` }}
              >
                <span className="absolute top-0.5 left-1 text-[10px] text-primary-700 font-semibold select-none whitespace-nowrap">
                  今天
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 每個專案 */}
        {projects.map((project) => {
          const stageIdx = STAGES.indexOf(project.stage as StageType)

          // 專案列標題
          return (
            <div key={project.id}>
              <div className="flex bg-primary-100 border-b border-primary-200">
                <div
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-primary-700 truncate flex items-center gap-1"
                  style={{ width: LABEL_WIDTH }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  {project.name}
                </div>
                <div className="flex-1 relative">
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div className="absolute top-0 bottom-0 border-l-2 border-primary-400 opacity-30" style={{ left: `${todayPct}%` }} />
                  )}
                </div>
              </div>

              {/* 每個階段子列 */}
              {STAGES.map((stage, sIdx) => {
                const stageTasks = project.tasks.filter((t) => t.stage === stage && t.dueDate)
                if (!stageTasks.length) return null

                const dates = stageTasks.flatMap((t) => [new Date(t.createdAt), new Date(t.dueDate)])
                const barStart  = new Date(Math.min(...dates.map((d) => d.getTime())))
                const barEnd    = new Date(Math.max(...dates.map((d) => d.getTime())))
                const leftPct   = pct(barStart)
                const widthPct  = Math.max(pct(barEnd) - leftPct, 0.5)
                const doneCount = stageTasks.filter((t) => t.completed).length

                let status: 'past' | 'current' | 'future' = 'future'
                if (sIdx < stageIdx)  status = 'past'
                if (sIdx === stageIdx) status = 'current'

                const { bar, text } = STAGE_COLOR[status]

                return (
                  <div
                    key={stage}
                    className="flex border-b border-primary-50 hover:bg-primary-50/60 transition-colors"
                    style={{ minHeight: 30 }}
                  >
                    <div
                      className="flex-shrink-0 px-3 flex items-center"
                      style={{ width: LABEL_WIDTH }}
                    >
                      <span
                        className={`text-[11px] pl-4 truncate ${
                          status === 'current' ? 'text-primary-700 font-semibold' :
                          status === 'past'    ? 'text-primary-500' : 'text-primary-300'
                        }`}
                      >
                        {status === 'past' && '✓ '}{stage}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      {todayPct >= 0 && todayPct <= 100 && (
                        <div className="absolute top-0 bottom-0 border-l-2 border-primary-400 opacity-20" style={{ left: `${todayPct}%` }} />
                      )}
                      {/* 階段 bar */}
                      <div
                        className={`absolute top-1.5 h-5 rounded ${bar} transition-all`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title={`${stage}：${stageTasks.length} 項任務，${doneCount} 項完成`}
                      >
                        {widthPct > 6 && (
                          <span className={`px-1.5 text-[10px] font-medium truncate block leading-5 select-none ${text}`}>
                            {doneCount}/{stageTasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* 圖例 */}
        <div className="flex gap-5 px-4 py-2 bg-primary-50 border-t border-primary-100">
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-primary-600 inline-block" /> 進行中階段
          </span>
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-primary-300 inline-block" /> 已完成階段
          </span>
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-primary-100 border border-primary-200 inline-block" /> 未來階段
          </span>
        </div>
      </div>
    </div>
  )
}
