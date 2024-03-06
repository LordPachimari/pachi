import React, { useEffect } from 'react'
import Image from 'next/image'
import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import { Loader2Icon } from 'lucide-react'

import type { Image as ImageType } from '@pachi/db'
import { cn } from '@pachi/utils'

import { Handle, Remove } from './components'
import styles from './Item.module.css'

export type ItemProps = ImageType & {
  id: UniqueIdentifier
}
export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  handle?: boolean
  handleProps?: Record<string, unknown> | undefined
  height?: number
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  listeners?: DraggableSyntheticListeners
  sorting?: boolean
  style?: React.CSSProperties
  transition?: string | undefined
  wrapperStyle?: React.CSSProperties | undefined
  value: UniqueIdentifier
  idMap: Map<UniqueIdentifier, ItemProps>
  onRemove?: (() => void) | undefined
  renderItem?:
    | ((args: {
        dragOverlay: boolean
        dragging: boolean
        sorting: boolean
        index: number | undefined
        fadeIn: boolean
        listeners: DraggableSyntheticListeners
        ref: React.Ref<HTMLElement>
        style: React.CSSProperties | undefined
        transform: Props['transform']
        transition: Props['transition']
        value: Props['value']
      }) => React.ReactElement)
    | undefined
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        idMap,

        ...props
      },
      ref,
    ) => {
      const image = idMap.get(value)
      useEffect(() => {
        if (!dragOverlay) {
          return
        }

        document.body.style.cursor = 'grabbing'

        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <li
          className={cn(
            styles['Wrapper'],
            fadeIn && styles['fadeIn'],
            sorting && styles['sorting'],
            dragOverlay && styles['dragOverlay'],
          )}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
              '--color': color,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <div
            className={cn(
              styles['Item'],
              dragging && styles['dragging'],
              handle && styles['withHandle'],
              dragOverlay && styles['dragOverlay'],
              disabled && styles['disabled'],
              color && styles['color'],
            )}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            <div>
              {image ? (
                <Image
                  alt={image.altText}
                  src={image.url}
                  width={index === 0 ? 200 : 140}
                  height={index === 0 ? 220 : 140}
                />
              ) : (
                <></>
              )}
              {image?.url.startsWith('blob') && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black opacity-30 dark:bg-white">
                  <Loader2Icon className="animate-spin text-white dark:text-black" />
                </div>
              )}
            </div>
            <span className={styles['Actions']}>
              {onRemove ? (
                <Remove className={styles['Remove']} onClick={onRemove} />
              ) : null}
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
            </span>
          </div>
        </li>
      )
    },
  ),
)
