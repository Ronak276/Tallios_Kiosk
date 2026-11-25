import { Button } from '../ui/button'
import { Modal } from '../ui/dialog'

/**
 * Confirmation modal before clearing an active order.
 */
export function ConfirmResetModal({ onKeepOrder, onConfirmReset }) {
  return (
    <Modal
      title="Start over?"
      description="This will clear the items in your current order."
      onClose={onKeepOrder}
    >
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onKeepOrder}>
          Keep order
        </Button>
        <Button onClick={onConfirmReset}>Start over</Button>
      </div>
    </Modal>
  )
}
