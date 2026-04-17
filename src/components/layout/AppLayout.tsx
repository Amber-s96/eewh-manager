import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useUserStore } from '../../store/userStore'
import { SEED_USERS } from '../../constants/seed-data'

export default function AppLayout() {
  const { currentUserId, setCurrentUserId } = useUserStore()
  const currentUser = SEED_USERS.find((u) => u.id === currentUserId)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-12 bg-white border-b border-primary-100 flex items-center justify-end px-6 flex-shrink-0 gap-3">
          <span className="text-xs text-primary-400">使用者：</span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(e.target.value)}
            className="border border-primary-200 rounded-lg px-2.5 py-1 text-xs text-primary-700 bg-white focus:outline-none focus:ring-1 focus:ring-primary-300"
          >
            {SEED_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}（{u.role === 'admin' ? '管理者' : '顧問'}）
              </option>
            ))}
          </select>
          {currentUser && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.name[0]}
            </div>
          )}
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
