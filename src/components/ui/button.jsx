import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-[#163e6b]',
        outline: 'border border-line bg-white text-ink hover:bg-wash',
        ghost: 'text-primary hover:bg-wash',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Button({ asChild, variant, className, ...props }) {
  const Component = asChild ? Slot : 'button'
  return <Component type={asChild ? undefined : 'button'} className={twMerge(clsx(buttonVariants({ variant }), className))} {...props} />
}
