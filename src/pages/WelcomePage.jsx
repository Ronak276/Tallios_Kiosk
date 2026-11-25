import { Button } from '../components/ui/button'
import { WelcomeLayout } from '../layout/WelcomeLayout'
import { ORDER_TYPES } from '../models'

export function WelcomePage({ onSelectMode, headingRef }) {
  return (
    <WelcomeLayout>
      <h1
        id="welcome-title"
        ref={headingRef}
        tabIndex={-1}
        className="mx-auto max-w-[25rem] text-center text-[1.625rem] leading-[1.25] font-semibold tracking-tight sm:text-[1.875rem]"
      >
        How would you like your <br className="hidden min-[400px]:block" />order?
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7">
        {ORDER_TYPES.map(({ label, Icon }) => (
          <Button
            key={label}
            variant="outline"
            className="h-auto min-h-24 flex-col gap-2.5 rounded-2xl bg-wash px-2 py-3 text-base hover:border-primary hover:bg-tint min-[540px]:min-h-26 min-[540px]:flex-row min-[540px]:gap-3 min-[540px]:text-lg"
            onClick={() => onSelectMode(label)}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-tint text-primary" aria-hidden="true">
              <Icon size={22} />
            </span>
            {label}
          </Button>
        ))}
      </div>
    </WelcomeLayout>
  )
}
