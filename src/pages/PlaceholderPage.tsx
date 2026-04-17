export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-10 text-center">
      <p className="text-4xl mb-4">🚧</p>
      <h1 className="text-lg font-medium text-primary-700">{title}</h1>
      <p className="text-sm text-primary-400 mt-2">此功能規劃於 Phase 2 開發</p>
    </div>
  )
}
