import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',        label: '案件總覽',   icon: '🗂️' },
  { to: '/my',      label: '個人工作區', icon: '👤' },
  { to: '/tools',   label: '工具區',     icon: '🔧' },
  { to: '/reports', label: '報表區',     icon: '📈' },
  { to: '/public',  label: '外部聯繫',   icon: '🔗' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-primary-100 flex flex-col py-6 gap-1 shadow-sm">
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="text-sm font-semibold text-primary-700 leading-tight">EEWH Manager</p>
            <p className="text-xs text-primary-400">綠建築專案管理</p>
          </div>
        </div>
      </div>

      {NAV.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `mx-2 px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-colors ${
              isActive
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-primary-600 hover:bg-primary-50'
            }`
          }
        >
          <span>{icon}</span>
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
