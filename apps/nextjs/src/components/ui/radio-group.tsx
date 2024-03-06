'use client'

import * as React from 'react'
import * as Primitives from '@radix-ui/react-radio-group'

import { cn } from '@pachi/utils'

const Root = React.forwardRef<
  React.ElementRef<typeof Primitives.Root>,
  React.ComponentPropsWithoutRef<typeof Primitives.Root>
>(({ className, ...props }, ref) => {
  return (
    <Primitives.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
Root.displayName = 'RadioGroup.Root'

const Item = React.forwardRef<
  React.ElementRef<typeof Primitives.Item>,
  React.ComponentPropsWithoutRef<typeof Primitives.Item>
>(({ className, ...props }, ref) => {
  return (
    <Primitives.Item
      ref={ref}
      className={cn(
        'group relative flex h-5 w-5 items-center justify-center outline-none',
        className,
      )}
      {...props}
    >
      <div className="group-hover:shadow-borders-strong-with-shadow flex h-[14px] w-[14px] items-center justify-center rounded-full bg-ui-bg-base shadow-borders-base-with-shadow outline-brand transition-all focus-visible:outline-brand group-focus:!shadow-borders-interactive-with-focus group-disabled:!bg-ui-bg-disabled group-disabled:!shadow-borders-base group-data-[state=checked]:bg-brand group-data-[state=checked]:shadow-borders-error">
        <Primitives.Indicator className="flex items-center justify-center">
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-ui-bg-base shadow-details-contrast-on-bg-interactive group-disabled:bg-ui-fg-disabled group-disabled:shadow-none',
            )}
          />
        </Primitives.Indicator>
      </div>
    </Primitives.Item>
  )
})
Item.displayName = 'RadioGroup.Item'

const RadioGroup = Object.assign(Root, { Item })

export { RadioGroup }
