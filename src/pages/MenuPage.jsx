import { useEffect, useRef, useState } from 'react'
import { FiShoppingBag } from 'react-icons/fi'
import { CartSidebar } from '../components/cart/CartSidebar'
import { PaymentCode } from '../components/cart/CartCheckout'
import { CategoryNav } from '../components/menu/CategoryNav'
import { MenuGrid } from '../components/menu/MenuGrid'
import { CheckoutModal } from '../components/modals/CheckoutModal'
import { ConfirmResetModal } from '../components/modals/ConfirmResetModal'
import { ItemCustomizer } from '../components/cart/ItemCustomizer'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/dialog'
import { cancelStripeCheckout, clearStripeReturn, openStripeCheckout, stripeEnabled, verifyStripeReturn } from '../stripePayment'
import { KioskHeader, KioskLayout } from '../layout/KioskLayout'
import {
  addCartLine,
  calculateItemCount,
  calculateSubtotal,
  createOrder,
  getMenuByCategory,
  formatMoney,
  updateCartLineQuantity,
} from '../models'

/**
 * Main menu ordering page with category filtering, customization, cart, and demo checkout.
 */
export function MenuPage({ mode, menuHeadingRef, onReset, stripeReturn }) {
  const [category, setCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [lines, setLines] = useState(() => stripeReturn?.canceled || stripeReturn?.qr ? stripeReturn.order.lines : [])
  const [paymentQr, setPaymentQr] = useState(() => stripeReturn?.qr ? stripeReturn : null)
  const [qrStatus, setQrStatus] = useState('')
  const [cancelingQr, setCancelingQr] = useState(false)
  const [order, setOrder] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [showPickup, setShowPickup] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const modalTrigger = useRef(null)
  const stripeOpening = useRef(false)
  const [paymentStatus, setPaymentStatus] = useState(stripeReturn && !stripeReturn.canceled && !stripeReturn.qr ? 'Verifying Stripe test payment…' : '')

  useEffect(() => {
    if (!stripeReturn || stripeReturn.qr) return
    if (stripeReturn.canceled) {
      clearStripeReturn()
      setPaymentStatus('Stripe checkout was canceled. Your cart is ready.')
      return
    }
    let active = true
    verifyStripeReturn(stripeReturn).then((result) => {
      if (!active) return
      const paidOrder = stripeReturn.order
      if (!result.paid || result.amount !== calculateSubtotal(paidOrder.lines) || result.orderId !== paidOrder.id) {
        throw new Error('Stripe has not confirmed this test payment.')
      }
      setOrder({ ...paidOrder, createdAt: new Date(paidOrder.createdAt), stripePaid: true })
      setPaymentStatus('')
      clearStripeReturn()
    }).catch(() => {
      if (active) setPaymentStatus('Could not verify Stripe test payment. Refresh this page to retry.')
    })
    return () => { active = false }
  }, [stripeReturn])

  useEffect(() => {
    if (!paymentQr || cancelingQr) return
    let active = true
    let timer
    async function poll() {
      try {
        const result = await verifyStripeReturn(paymentQr)
        if (!active) return
        if (result.paid || result.expired) {
          finishQr(result, paymentQr)
          return
        }
        setQrStatus('Waiting for Stripe to confirm the test payment…')
      } catch {
        if (active) setQrStatus('Connection interrupted. Retrying…')
      }
      if (active) timer = window.setTimeout(poll, 3000)
    }
    poll()
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [paymentQr, cancelingQr])

  function finishQr(result, pending) {
    if (result.paid && (result.orderId !== pending.order.id || result.amount !== calculateSubtotal(pending.order.lines))) {
      setQrStatus('Stripe returned a payment that does not match this order.')
      return
    }
    clearStripeReturn()
    setPaymentQr(null)
    if (result.paid) {
      setOrder({ ...pending.order, createdAt: new Date(pending.order.createdAt), stripePaid: true })
      setLines([])
      setSelectedItem(null)
      setShowPickup(false)
    } else {
      setPaymentStatus('Payment QR closed. Your cart is ready.')
      restoreFocus()
    }
  }

  async function closeQr() {
    if (cancelingQr) return
    setCancelingQr(true)
    setQrStatus('Checking Stripe before closing…')
    try {
      const result = await cancelStripeCheckout(paymentQr)
      if (result.paid || result.expired) finishQr(result, paymentQr)
      else setQrStatus('Stripe could not close this session. Try again.')
    } catch {
      setQrStatus('Could not close the Stripe session. Try again.')
    } finally {
      setCancelingQr(false)
    }
  }

  useEffect(() => {
    if (!processing) return

    const timer = window.setTimeout(() => {
      setLines([])
      setSelectedItem(null)
      setProcessing(false)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [processing])

  function restoreFocus() {
    requestAnimationFrame(() => {
      if (modalTrigger.current?.isConnected && !modalTrigger.current.disabled) {
        modalTrigger.current.focus()
      } else {
        menuHeadingRef.current?.focus()
      }
    })
  }

  function handleStartOver(event) {
    if (!lines.length) {
      onReset()
      return
    }
    modalTrigger.current = event.currentTarget
    setConfirmReset(true)
  }

  function handleSelectItem(entry, triggerEl) {
    modalTrigger.current = triggerEl
    setSelectedItem(entry)
  }

  function handleAddItem(line) {
    setLines((current) => addCartLine(current, line))
    setAnnouncement(line.quantity + ' × ' + line.name + ' added to your order.')
    setSelectedItem(null)
    restoreFocus()
  }

  function handleQuantityChange(key, value) {
    setLines((current) => updateCartLineQuantity(current, key, value))
  }

  async function handleCheckout(trigger, customerName, qr = false) {
    if (processing || !lines.length) return
    modalTrigger.current = trigger
    const nextOrder = { ...createOrder(mode, lines), customerName }
    if (stripeEnabled) {
      if (stripeOpening.current || paymentQr) return
      stripeOpening.current = true
      setPaymentStatus('Opening Stripe test checkout…')
      try {
        const pending = await openStripeCheckout({ ...nextOrder, id: nextOrder.id.replace('DEMO-', 'TEST-') }, qr)
        if (qr) {
          setQrStatus('Waiting for Stripe to confirm the test payment…')
          setPaymentQr(pending)
          setPaymentStatus('')
          stripeOpening.current = false
        }
      } catch (error) {
        setPaymentStatus(error.message || 'Could not open Stripe Checkout.')
        stripeOpening.current = false
      }
      return
    }
    setOrder(nextOrder)
    setProcessing(true)
    setShowPickup(false)
  }

  const visibleItems = getMenuByCategory(category)
  const count = calculateItemCount(lines)

  return (
    <KioskLayout>
      <div className="grid items-start gap-4 lg:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,27%)]">
        <section aria-labelledby="menu-title" className="min-w-0">
          <KioskHeader mode={mode} onStartOver={handleStartOver} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1
              id="menu-title"
              ref={menuHeadingRef}
              tabIndex={-1}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              What are you having today?
            </h1>
            <Button asChild variant="outline" className="md:hidden">
              <a href="#cart">
                <FiShoppingBag /> Order ({count})
              </a>
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted">Surinamese flavors, roasted in San Francisco.</p>
          <div className="mt-5 grid items-start rounded-2xl border border-line bg-white lg:grid-cols-[7rem_minmax(0,1fr)]">
            <CategoryNav activeCategory={category} onSelect={setCategory} />
            <MenuGrid category={category} items={visibleItems} onSelectItem={handleSelectItem} />
          </div>
        </section>

        <CartSidebar
          lines={lines}
          paymentStatus={paymentStatus}
          onQuantityChange={handleQuantityChange}
          onCheckout={handleCheckout}
          customizer={selectedItem && (
            <ItemCustomizer
              key={selectedItem.id}
              item={selectedItem}
              onClose={() => {
                setSelectedItem(null)
                restoreFocus()
              }}
              onAdd={handleAddItem}
            />
          )}
        />
      </div>

      <p className="sr-only" role="status">
        {announcement}
      </p>

      {paymentQr && (
        <Modal title="Scan to pay" description={formatMoney(calculateSubtotal(paymentQr.order.lines)) + ' · Stripe test mode'} onClose={closeQr}>
          <PaymentCode message={paymentQr.url} label="Stripe test checkout QR code" caption="Scan with your phone to open Stripe Checkout." />
          <p role="status" className="mt-3 text-center text-sm text-muted">{qrStatus}</p>
        </Modal>
      )}

      {order && (
        <CheckoutModal
          order={order}
          processing={processing}
          showPickup={showPickup}
          onPickup={() => setShowPickup(true)}
          onReset={onReset}
          onClose={() => {
            setProcessing(false)
            setOrder(null)
            restoreFocus()
          }}
        />
      )}

      {confirmReset && (
        <ConfirmResetModal
          onKeepOrder={() => {
            setConfirmReset(false)
            restoreFocus()
          }}
          onConfirmReset={onReset}
        />
      )}
    </KioskLayout>
  )
}








