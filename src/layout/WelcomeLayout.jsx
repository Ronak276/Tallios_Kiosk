import { Brand } from '../components/common/Brand'

export function WelcomeLayout({ children }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5 py-8 sm:py-10">
      <div className="w-full max-w-[36rem]">
        <header className="mb-7 text-center sm:mb-8">
          <Brand className="mx-auto w-[4.5rem]" decorative />
          <p className="mt-4 text-[2.75rem] leading-none font-bold tracking-tight sm:text-[3.375rem]">TALLIO’S</p>
          <p className="mt-4 text-xs font-bold tracking-[0.25em] text-primary">COFFEE & TEA CO.</p>
        </header>
        <section aria-labelledby="welcome-title" className="rounded-3xl border border-line bg-white px-5 py-7 shadow-[0_14px_40px_#143f6910] sm:p-9">
          {children}
        </section>
      </div>
    </main>
  )
}

