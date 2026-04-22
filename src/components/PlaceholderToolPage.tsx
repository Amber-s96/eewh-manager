import BackButton from './BackButton'

interface Props {
  icon: string
  title: string
  subtitle: string
  description: string
}

export default function PlaceholderToolPage({ icon, title, subtitle, description }: Props) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <BackButton to="/tools" label="返回工具區" />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h1 className="text-2xl font-semibold text-primary-800">{title}</h1>
      </div>
      <p className="text-sm text-primary-500 mb-8">{subtitle}</p>
      <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-10 text-center">
        <p className="text-4xl mb-4">🚧</p>
        <p className="text-primary-700 font-medium mb-2">規格確認中，即將開發</p>
        <p className="text-sm text-primary-400">{description}</p>
      </div>
    </div>
  )
}
