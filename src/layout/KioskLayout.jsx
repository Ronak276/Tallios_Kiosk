import { FiArrowLeft } from 'react-icons/fi'
import { Brand } from '../components/common/Brand'
import { Button } from '../components/ui/button'

export function KioskLayout({ children }) {
  return <main className="min-h-dvh bg-white px-4 py-5 sm:px-6 sm:py-6">{children}</main>
}

export function KioskHeader({ mode, onStartOver }) {
  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" className="bg-wash text-primary" onClick={onStartOver}>
        <FiArrowLeft /> Start over
      </Button>
      <Brand className="w-12" />
      <span className="rounded-lg border border-line bg-wash px-3 py-2 text-sm font-bold text-primary">
        {mode}
      </span>
    </header>
  )
}
