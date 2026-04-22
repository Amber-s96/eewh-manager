import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="text-sm text-primary-500 hover:text-primary-700 mb-5 flex items-center gap-1"
    >
      ← {label}
    </button>
  )
}
