import { MeasuringStrategy } from "@dnd-kit/core"
import {
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable"

import { GridContainer } from "../components/GridContainer"
import type { ItemProps } from "../components/Item/Item"
import type { Props as SortableProps } from "../types"
import { Sortable } from "./Sortable"

const props: Partial<SortableProps> = {
  adjustScale: true,
  Container: (props: any) => <GridContainer {...props} columns={5} />,
  strategy: rectSortingStrategy,
  wrapperStyle: () => ({
    width: 140,
    height: 140,
  }),
}
export const LargeFirstTile = ({
  items,
  updateImagesOrder,
}: {
  items: ItemProps[]
  updateImagesOrder?: ({
    order,
  }: {
    order: Record<string, number>
  }) => Promise<void>
}) => {
  const animateLayoutChanges: AnimateLayoutChanges = (args) =>
    defaultAnimateLayoutChanges({ ...args, wasDragging: true })
  return (
    //@ts-ignore
    <Sortable
      {...props}
      removable
      items={items}
      itemsType="images"
      updateImagesOrder={updateImagesOrder}
      handle
      animateLayoutChanges={animateLayoutChanges}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      getItemStyles={({ index }) => {
        if (index === 0) {
          return {
            fontSize: "2rem",
          }
        }

        return {}
      }}
      wrapperStyle={({ index }) => {
        if (index === 0) {
          return {
            maxHeight: 288,
            gridRow: "span 2",
            gridColumn: "span 2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        }

        return {}
      }}
    />
  )
}
