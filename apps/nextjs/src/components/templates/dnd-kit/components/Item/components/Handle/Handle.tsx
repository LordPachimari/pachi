import React, { forwardRef } from 'react'
import { GripVerticalIcon } from 'lucide-react'

import { Action, type ActionProps } from '../Action'

export const Handle = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action
        ref={ref}
        cursor="grab"
        data-cypress="draggable-handle"
        {...props}
      >
        <GripVerticalIcon
          size={20}
          className="text-gray-800 dark:text-gray-600"
        />
      </Action>
    )
  },
)
Handle.displayName = 'Handle'
