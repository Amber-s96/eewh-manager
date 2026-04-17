import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useUserStore } from '../store/userStore'
import { SEED_USERS } from '../constants/seed-data'
import { TASK_TEMPLATES } from '../constants/task-templates'
import type { StageType, Task } from '../types'

const STAGES: StageType[] = ['前期評估','圖說蒐集','計算檢討','圖說修改','產製報告書','待審查','候選結案']

function getStageCompletion(tasks: Task[], stage: StageType) {
  const stageTasks = tasks.filter(t => t.stage === stage)
  if (stageTasks.length === 0) return { total: 0, done: 0, pct: 0 }
  const done = stageTasks.filter(t => t.completed).length
  return { total: stageTasks.length, done, pct: Math.round((done / stageTasks.length) * 100) }
}

function Avatar({ userId, size = 'sm' }: { userId: string; size?: 'sm' | 'xs' }) {
  const user = SEED_USERS.find(u => u.id === userId)
  if (!user) return null
  const cls = size === 'xs' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
      style={{ backgroundColor: user.avatarColor }}
      title={user.name}
    >
      {user.name[0]}
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project    = useProjectStore(s => s.projects.find(p => p.id === id))
  const updateTask = useProjectStore(s => s.updateTask)
  const deleteTask = useProjectStore(s => s.deleteTask)
  const addTask    = useProjectStore(s => s.addTask)
  const { currentUserId } = useUserStore()

  const currentUser = SEED_USERS.find(u => u.id === currentUserId)
  const isAdmin = currentUser?.role === 'admin'

  const [newTaskTitle, setNewTaskTitle]   = useState('')
  const [newTaskStage, setNewTaskStage]   = useState<StageType>('前期評估')
  const [newIndicator, setNewIndicator]   = useState('')
  const [newAssignees, setNewAssignees]   = useState<string[]>([])
  const [showTemplate, setShowTemplate]   = useState(false)
  const [activeStageFilter, setActiveStageFilter] = useState<StageType | '全部'>('全部')
  const templateRef = useRef<HTMLDivElement>(null)

  if (!project) return (
    <div className="p-10 text-center text-primary-400">
      找不到此案件 <button onClick={() => navigate('/')} className="underline ml-2">返回總覽</button>
    </div>
  )

  const stageIndex = STAGES.indexOf(project.stage)

  const effectiveActiveIndex = (() => {
    for (let i = stageIndex; i >= 0; i--) {
      const { total, done } = getStageCompletion(project.tasks, STAGES[i])
      if (total > 0 && done < total)   return i
      if (total > 0 && done === total) return stageIndex
    }
    return stageIndex
  })()

  function handleAddTask() {
    if (!newTaskTitle.trim()) return
    const task: Task = {
      id: `t-${Date.now()}`,
      projectId: project!.id,
      stage: newTaskStage,
      title: newTaskTitle.trim(),
      assignees: newAssignees,
      dueDate: '',
      completed: false,
      notes: '',
      indicator: newIndicator || undefined,
      timeSpent: 0,
      createdAt: new Date().toISOString(),
    }
    addTask(project!.id, task)
    setNewTaskTitle('')
    setNewIndicator('')
    setNewAssignees([])
  }

  function handleApplyTemplate(tpl: typeof TASK_TEMPLATES[0]) {
    const task: Task = {
      id: `t-${Date.now()}`,
      projectId: project!.id,
      stage: tpl.stage,
      title: tpl.title,
      assignees: [],
      dueDate: '',
      completed: false,
      notes: tpl.notes ?? '',
      indicator: tpl.indicator,
      timeSpent: 0,
      createdAt: new Date().toISOString(),
    }
    addTask(project!.id, task)
    setShowTemplate(false)
  }

  const filteredTasks = activeStageFilter === '全部'
    ? project.tasks
    : project.tasks.filter(t => t.stage === activeStageFilter)

  const memberUsers = SEED_USERS.filter(u => project.members.includes(u.id))

  return (
    <div className="p-6 max-w-5xl">
      <button onClick={() => navigate('/')} className="text-sm text-primary-400 hover:text-primary-600 mb-4 flex items-center gap-1">
        ← 返回總覽
      </button>

      {/* 頂部資訊列 */}
      <div className="bg-white rounded-xl border border-primary-100 p-5 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary-800">{project.name}</h1>
            <p className="text-sm text-primary-500 mt-1">{project.address}</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 rounded-lg bg-primary-100 text-primary-700">{project.type}</span>
            <span className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700">{project.grade}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-primary-500">
          <span>聯絡窗口：{project.contact}</span>
          <span>案號：{project.publicCode}</span>
          <span>有效面積：{project.effectiveFloorArea.toLocaleString()} m²</span>
        </div>

        {/* 組員顯示（所有人可見） */}
        <div className="mt-4 pt-4 border-t border-primary-50 flex items-center gap-2">
          <span className="text-xs text-primary-400 mr-1">專案組員：</span>
          {memberUsers.map(u => (
            <div key={u.id} className="flex items-center gap-1.5">
              <Avatar userId={u.id} />
              <span className="text-xs text-primary-600">{u.name}</span>
              {u.role === 'admin' && (
                <span className="text-[10px] bg-primary-200 text-primary-600 px-1 rounded">管理者</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 進行階段色塊 */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-primary-600 mb-3">進行階段</h2>
        <div className="flex gap-2 flex-wrap">
          {STAGES.map((s, i) => {
            const { total, done, pct } = getStageCompletion(project.tasks, s)
            const isCompleted = total > 0 && done === total
            const isActive    = i === effectiveActiveIndex
            const isFuture    = i > stageIndex

            let blockStyle = ''
            if (isActive)         blockStyle = 'bg-primary-700 text-white border-primary-700'
            else if (isFuture)    blockStyle = 'bg-primary-50 text-primary-300 border border-primary-100'
            else if (isCompleted) blockStyle = 'bg-primary-400 text-white border-primary-400'
            else                  blockStyle = 'bg-primary-100 text-primary-500 border-primary-100'

            return (
              <button
                key={s}
                onClick={() => {
                  const next = activeStageFilter === s ? '全部' : s
                  setActiveStageFilter(next)
                  if (next !== '全部') setNewTaskStage(next as StageType)
                }}
                className={`relative px-4 pt-2 pb-3 rounded-lg text-sm font-medium transition-all min-w-[100px] text-left border ${blockStyle} ${activeStageFilter === s ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{s}</span>
                  {isCompleted && <span className="text-xs">✓</span>}
                </div>
                {total > 0 ? (
                  <div className="mt-1.5">
                    <div className="h-1 rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full rounded-full bg-white/80 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] mt-0.5 opacity-80">{done}/{total} 完成</p>
                  </div>
                ) : (
                  <p className="text-[10px] mt-1 opacity-50">無子任務</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 子任務列表 */}
      <div className="bg-white rounded-xl border border-primary-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-primary-600">
            子任務
            {activeStageFilter !== '全部' && (
              <span className="ml-2 text-xs text-primary-400">
                — {activeStageFilter}
                <button onClick={() => setActiveStageFilter('全部')} className="ml-1 hover:text-primary-600">×</button>
              </span>
            )}
          </h2>
          <span className="text-xs text-primary-400">{filteredTasks.length} 項</span>
        </div>

        {filteredTasks.length === 0 && (
          <p className="text-sm text-primary-300 mb-4">
            {activeStageFilter === '全部' ? '尚無子任務' : '此階段尚無子任務'}
          </p>
        )}

        <div className="flex flex-col gap-2 mb-4">
          {filteredTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              projectId={project.id}
              projectMembers={project.members}
              isAdmin={isAdmin}
              onUpdate={updateTask}
              onDelete={() => deleteTask(project.id, task.id)}
            />
          ))}
        </div>

        {/* 新增子任務區（管理者限定） */}
        {isAdmin && (
          <div className="mt-3 pt-4 border-t border-primary-50 space-y-3">
            {/* 第一列：階段 + 指標 + 指派 */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={newTaskStage}
                onChange={e => setNewTaskStage(e.target.value as StageType)}
                className="text-sm border border-primary-200 rounded-lg px-2 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>

              <select
                value={newIndicator}
                onChange={e => setNewIndicator(e.target.value)}
                className="text-sm border border-primary-200 rounded-lg px-2 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">（無指標）</option>
                {['綠化','保水','水資源','日常節能','CO2減量','廢棄物減量','室內環境','垃圾處理','生物多樣性'].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>

              {/* 指派成員多選 */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-primary-400">指派：</span>
                {memberUsers.map(u => (
                  <label key={u.id} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAssignees.includes(u.id)}
                      onChange={e => {
                        setNewAssignees(prev =>
                          e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                        )
                      }}
                      className="accent-primary-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-primary-600">{u.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 第二列：標題輸入 + 按鈕 */}
            <div className="flex gap-2">
              <input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="新增子任務標題..."
                className="flex-1 text-sm border border-primary-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                新增
              </button>

              {/* 模板按鈕 */}
              <div className="relative" ref={templateRef}>
                <button
                  onClick={() => setShowTemplate(v => !v)}
                  className="px-3 py-1.5 bg-primary-100 text-primary-700 text-sm rounded-lg hover:bg-primary-200 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  📋 範本
                </button>

                {showTemplate && (
                  <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl border border-primary-200 shadow-lg z-30 overflow-hidden">
                    <div className="px-3 py-2 bg-primary-50 border-b border-primary-100">
                      <p className="text-xs font-semibold text-primary-700">EEWH 常用子任務範本</p>
                      <p className="text-[10px] text-primary-400 mt-0.5">點擊即可直接新增至專案</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {TASK_TEMPLATES.map((tpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplyTemplate(tpl)}
                          className="w-full px-3 py-2 text-left hover:bg-primary-50 flex items-start gap-2 border-b border-primary-50 last:border-0 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-primary-700 truncate">{tpl.title}</p>
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              <span className="text-[10px] bg-primary-100 text-primary-500 px-1 rounded">{tpl.stage}</span>
                              {tpl.indicator && (
                                <span className="text-[10px] bg-primary-200 text-primary-600 px-1 rounded">{tpl.indicator}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── TaskRow ───────────────────────────────────────────────────────────────────

function TaskRow({ task, projectId, projectMembers, isAdmin, onUpdate, onDelete }: {
  task: Task
  projectId: string
  projectMembers: string[]
  isAdmin: boolean
  onUpdate: (pid: string, tid: string, patch: Partial<Task>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Pick<Task, 'title' | 'dueDate' | 'notes' | 'stage' | 'assignees' | 'indicator'>>({
    title:     task.title,
    dueDate:   task.dueDate,
    notes:     task.notes,
    stage:     task.stage,
    assignees: task.assignees,
    indicator: task.indicator,
  })

  const memberUsers = SEED_USERS.filter(u => projectMembers.includes(u.id))

  function handleSave() {
    if (!draft.title.trim()) return
    onUpdate(projectId, task.id, {
      title:     draft.title.trim(),
      dueDate:   draft.dueDate,
      notes:     draft.notes,
      stage:     draft.stage,
      assignees: draft.assignees,
      indicator: draft.indicator,
    })
    setEditing(false)
  }

  function handleCancel() {
    setDraft({ title: task.title, dueDate: task.dueDate, notes: task.notes, stage: task.stage, assignees: task.assignees, indicator: task.indicator })
    setEditing(false)
  }

  if (editing && isAdmin) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 flex flex-col gap-3">
        {/* 標題 + 階段 */}
        <div className="flex gap-2">
          <input
            autoFocus
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
            placeholder="子任務名稱"
            className="flex-1 text-sm border border-primary-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
          />
          <select
            value={draft.stage}
            onChange={e => setDraft(d => ({ ...d, stage: e.target.value as StageType }))}
            className="text-sm border border-primary-200 rounded-lg px-2 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {['前期評估','圖說蒐集','計算檢討','圖說修改','產製報告書','待審查','候選結案'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* 指標 */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-primary-500 w-16 flex-shrink-0">指標</label>
          <select
            value={draft.indicator ?? ''}
            onChange={e => setDraft(d => ({ ...d, indicator: e.target.value || undefined }))}
            className="text-sm border border-primary-200 rounded-lg px-2 py-1.5 bg-white text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="">（無指標）</option>
            {['綠化','保水','水資源','日常節能','CO2減量','廢棄物減量','室內環境','垃圾處理','生物多樣性'].map(i => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* 截止日期 */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-primary-500 w-16 flex-shrink-0">截止日期</label>
          <input
            type="date"
            value={draft.dueDate}
            onChange={e => setDraft(d => ({ ...d, dueDate: e.target.value }))}
            className="text-sm border border-primary-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {/* 指派成員（管理者編輯時可指派） */}
        <div className="flex items-start gap-2">
          <label className="text-xs text-primary-500 w-16 flex-shrink-0 pt-1">指派組員</label>
          <div className="flex flex-wrap gap-2">
            {memberUsers.map(u => (
              <label key={u.id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.assignees.includes(u.id)}
                  onChange={e =>
                    setDraft(d => ({
                      ...d,
                      assignees: e.target.checked
                        ? [...d.assignees, u.id]
                        : d.assignees.filter(id => id !== u.id),
                    }))
                  }
                  className="accent-primary-500 w-3.5 h-3.5"
                />
                <Avatar userId={u.id} size="xs" />
                <span className="text-xs text-primary-700">{u.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 備註 */}
        <div className="flex items-start gap-2">
          <label className="text-xs text-primary-500 w-16 flex-shrink-0 pt-2">備註</label>
          <textarea
            value={draft.notes}
            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
            placeholder="輸入備註..."
            rows={2}
            className="flex-1 text-sm border border-primary-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-primary-500 hover:text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">取消</button>
          <button onClick={handleSave}   className="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">儲存</button>
        </div>
      </div>
    )
  }

  // 一般顯示模式
  const isOverdue = !task.completed && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)

  return (
    <div className={`group rounded-lg border transition-colors ${task.completed ? 'bg-primary-50 border-primary-100' : 'bg-white border-primary-100 hover:border-primary-200'}`}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={e => onUpdate(projectId, task.id, { completed: e.target.checked })}
          className="w-4 h-4 accent-primary-500 flex-shrink-0"
        />

        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-primary-300' : 'text-primary-700'}`}>
          {task.title}
        </span>

        {/* 標籤區 */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          <span className="text-xs text-primary-400 bg-primary-50 px-2 py-0.5 rounded">{task.stage}</span>

          {task.indicator && (
            <span className="text-xs text-primary-500 bg-primary-100 px-2 py-0.5 rounded">{task.indicator}</span>
          )}

          {task.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
              isOverdue ? 'bg-red-50 text-red-400' : 'bg-primary-50 text-primary-400'
            }`}>
              📅 {task.dueDate}
              {isOverdue && ' ⚠️'}
            </span>
          )}

          {/* 指派組員顯示（所有人可見） */}
          {task.assignees.length > 0 && (
            <div className="flex items-center gap-0.5 ml-1">
              {task.assignees.map(uid => (
                <Avatar key={uid} userId={uid} size="xs" />
              ))}
            </div>
          )}
        </div>

        {/* 編輯 / 刪除（管理者限定） */}
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              title="編輯"
              className="p-1.5 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.829 1.172H7v-2a4 4 0 011.172-2.829z" />
              </svg>
            </button>
            <button
              onClick={() => { if (confirm(`確定刪除「${task.title}」？`)) onDelete() }}
              title="刪除"
              className="p-1.5 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {task.notes && (
        <p className="px-10 pb-2.5 text-xs text-primary-400 leading-relaxed">{task.notes}</p>
      )}
    </div>
  )
}
