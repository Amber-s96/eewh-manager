import { useNavigate } from 'react-router-dom'

const TOOLS = [
  {
    to: '/tools/screening',
    icon: '🔍',
    title: '初期評估',
    subtitle: '快速判斷可達等級',
    description: '輸入基本建案條件，初估九大指標難易度與可達到的綠建築等級範圍。',
    status: 'coming' as const,
  },
  {
    to: '/tools/carbon',
    icon: '🌱',
    title: '低碳計算',
    subtitle: 'CO₂ 減量指標',
    description: '計算建材及施工過程的碳排放量，評估 CO₂ 減量指標得分。',
    status: 'coming' as const,
  },
  {
    to: '/tools/bers',
    icon: '⚡',
    title: 'BERS 計算',
    subtitle: '日常節能指標',
    description: '依據 BERSn 計算邏輯，輸入空間類型與面積，取得 EUI*、ESR、節能評分。',
    status: 'ready' as const,
  },
]

export default function ToolsPage() {
  const navigate = useNavigate()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-primary-800 mb-1">工具區</h1>
        <p className="text-sm text-primary-500">EEWH 綠建築各項指標計算工具</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TOOLS.map((tool) => (
          <button
            key={tool.to}
            onClick={() => tool.status === 'ready' && navigate(tool.to)}
            className={`text-left p-6 rounded-2xl border transition-all duration-150 ${
              tool.status === 'ready'
                ? 'border-primary-200 bg-white hover:border-primary-400 hover:shadow-md cursor-pointer'
                : 'border-primary-100 bg-primary-50/50 cursor-default'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{tool.icon}</span>
              {tool.status === 'coming' ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-500">
                  開發中
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                  可使用
                </span>
              )}
            </div>
            <p className="font-semibold text-primary-800 mb-0.5">{tool.title}</p>
            <p className="text-xs text-primary-500 mb-3">{tool.subtitle}</p>
            <p className="text-sm text-primary-600 leading-relaxed">{tool.description}</p>
            {tool.status === 'ready' && (
              <p className="mt-4 text-xs text-primary-400 flex items-center gap-1">
                點擊進入 →
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
