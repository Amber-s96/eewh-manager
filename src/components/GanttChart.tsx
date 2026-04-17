import { differenceInDays, eachMonthOfInterval, format, startOfMonth } from 'date-fns'
import type { Project } from '../types'

interface Props {
  projects: Project[]
}

const LABEL_WIDTH = 220

export default function GanttChart({ projects }: Props) {
  const allTasks = projects.flatMap((p) =>
    p.tasks.filter((t) => t.dueDate).map((t) => ({ ...t, projectName: p.name }))
  )

  if (!allTasks.length) {
    return (
      <div className="flex items-center justify-center h-32 text-primary-400 text-sm">
        目前無任何子任務資料
      </div>
    )
  }

  const dates = allTasks.flatMap((t) => [new Date(t.createdAt), new Date(t.dueDate)])
  const rawStart = new Date(Math.min(...dates.map((d) => d.getTime())))
  const rawEnd   = new Date(Math.max(...dates.map((d) => d.getTime())))

  const startDate = startOfMonth(rawStart)
  const endDate   = new Date(rawEnd)
  endDate.setDate(endDate.getDate() + 14)

  const totalDays = differenceInDays(endDate, startDate) || 1

  const pct = (date: Date) => {
    const days = differenceInDays(date, startDate)
    return Math.max(0, Math.min(100, (days / totalDays) * 100))
  }

  const months = eachMonthOfInterval({ start: startDate, end: endDate })
  const today  = new Date()
  const todayPct = pct(today)

  return (
    <div className="overflow-x-auto rounded border border-primary-100">
      <div style={{ minWidth: 800 }}>
        {/* Timeline header */}
        <div className="flex" style={{ height: 36 }}>
          <div
            className="flex-shrink-0 bg-primary-100 border-b border-r border-primary-200 flex items-center px-3 text-xs font-medium text-primary-600"
            style={{ width: LABEL_WIDTH }}
          >
            專案 / 子任務
          </div>
          <div className="flex-1 relative bg-primary-50 border-b border-primary-100">
            {months.map((m) => (
              <div
                key={m.toISOString()}
                className="absolute top-0 h-full border-l border-primary-200 flex items-center"
                style={{ left: `${pct(m)}%` }}
              >
                <span className="text-xs text-primary-500 pl-1 select-none">{format(m, 'yyyy/M')}</span>
              </div>
            ))}
            {/* Today marker */}
            {todayPct >= 0 && todayPct <= 100 && (
              <div
                className="absolute top-0 h-full border-l-2 border-primary-500 z-10"
                style={{ left: `${todayPct}%` }}
              >
                <span className="absolute top-1 left-1 text-[10px] text-primary-700 font-semibold select-none whitespace-nowrap">
                  今天
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rows grouped by project */}
        {projects.map((project) => {
          const tasks = project.tasks.filter((t) => t.dueDate)
          if (!tasks.length) return null
          return (
            <div key={project.id}>
              {/* Project label row */}
              <div className="flex bg-primary-100 border-b border-primary-200">
                <div
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-primary-700 truncate"
                  style={{ width: LABEL_WIDTH }}
                >
                  {project.name}
                </div>
                <div className="flex-1 relative">
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-primary-400 opacity-40"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Task rows */}
              {tasks.map((task) => {
                const barStart = new Date(task.createdAt)
                const barEnd   = new Date(task.dueDate)
                const leftPct  = pct(barStart)
                const widthPct = Math.max(pct(barEnd) - leftPct, 0.5)
                const isOverdue = !task.completed && barEnd < today

                let barColor = 'bg-primary-500'
                if (task.completed) barColor = 'bg-primary-300'
                else if (isOverdue) barColor = 'bg-warn'

                return (
                  <div
                    key={task.id}
                    className="flex border-b border-primary-50 hover:bg-primary-50 transition-colors"
                    style={{ minHeight: 34 }}
                  >
                    <div
                      className="flex-shrink-0 px-3 flex items-center gap-2"
                      style={{ width: LABEL_WIDTH }}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          task.completed ? 'bg-primary-400' : isOverdue ? 'bg-warn' : 'bg-primary-600'
                        }`}
                      />
                      <span className="text-xs text-primary-700 truncate" title={task.title}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      {/* Today line */}
                      {todayPct >= 0 && todayPct <= 100 && (
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-primary-400 opacity-30"
                          style={{ left: `${todayPct}%` }}
                        />
                      )}
                      {/* Task bar */}
                      <div
                        className={`absolute top-2 h-5 rounded ${barColor} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        title={`${task.title}  截止：${task.dueDate}${task.indicator ? `  指標：${task.indicator}` : ''}`}
                      >
                        {widthPct > 8 && (
                          <span className="px-1.5 text-[10px] text-white font-medium truncate block leading-5 select-none">
                            {task.indicator ?? ''}
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

        {/* Legend */}
        <div className="flex gap-4 px-4 py-2 bg-primary-50 border-t border-primary-100">
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-primary-500 inline-block" /> 進行中
          </span>
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-primary-300 inline-block" /> 已完成
          </span>
          <span className="flex items-center gap-1.5 text-xs text-primary-600">
            <span className="w-3 h-3 rounded bg-warn inline-block" /> 已逾期
          </span>
        </div>
      </div>
    </div>
  )
}
