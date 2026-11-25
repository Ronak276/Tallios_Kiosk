import * as Dialog from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'
import { Button } from './button'

export function Modal({ title, description, children, icon, onClose, className = '' }) {
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/75" />
        <Dialog.Content className={'fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 ' + className}>
          <Dialog.Close asChild>
            <Button variant="ghost" className="absolute top-3 right-3 size-11 p-0" aria-label="Close dialog"><FiX size={20} /></Button>
          </Dialog.Close>
          {icon}
          <Dialog.Title className="pr-9 text-2xl font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-muted">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

