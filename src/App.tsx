import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProjectListPage from './pages/ProjectListPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import BersPage from './pages/BersPage'
import MyWorkspacePage from './pages/MyWorkspacePage'
import ReportsPage from './pages/ReportsPage'
import PublicQueryPage from './pages/PublicQueryPage'
import ToolsPage from './pages/ToolsPage'
import ScreeningPage from './pages/ScreeningPage'
import CarbonPage from './pages/CarbonPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/"            element={<ProjectListPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/my"          element={<MyWorkspacePage />} />
          <Route path="/reports"     element={<ReportsPage />} />
          {/* 工具區 */}
          <Route path="/tools"               element={<ToolsPage />} />
          <Route path="/tools/bers"          element={<BersPage />} />
          <Route path="/tools/screening"     element={<ScreeningPage />} />
          <Route path="/tools/carbon"        element={<CarbonPage />} />
        </Route>
        {/* 外部查詢：獨立頁面，不含 sidebar */}
        <Route path="/public" element={<PublicQueryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
