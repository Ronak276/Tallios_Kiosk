import { useEffect, useRef, useState } from 'react'
import { MenuPage } from '../pages/MenuPage'
import { WelcomePage } from '../pages/WelcomePage'
import { getStripeReturn } from '../stripePayment'
import { ROUTES } from './routes'

/**
 * Top-level route controller switching between Welcome and Menu pages.
 */
export function AppRoutes() {
  const [stripeReturn, setStripeReturn] = useState(getStripeReturn)
  const [mode, setMode] = useState(stripeReturn?.order.mode ?? null)
  const welcomeHeadingRef = useRef(null)
  const menuHeadingRef = useRef(null)

  const currentRoute = mode ? ROUTES.MENU : ROUTES.WELCOME

  useEffect(() => {
    if (currentRoute === ROUTES.MENU) {
      window.scrollTo(0, 0)
      menuHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [currentRoute])

  function handleReset() {
    setStripeReturn(null)
    setMode(null)
    window.scrollTo(0, 0)
    requestAnimationFrame(() => welcomeHeadingRef.current?.focus({ preventScroll: true }))
  }

  if (currentRoute === ROUTES.WELCOME) {
    return <WelcomePage onSelectMode={setMode} headingRef={welcomeHeadingRef} />
  }

  return <MenuPage mode={mode} menuHeadingRef={menuHeadingRef} onReset={handleReset} stripeReturn={stripeReturn} />
}

