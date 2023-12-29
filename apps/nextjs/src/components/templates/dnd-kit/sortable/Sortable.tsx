import { useEffect, useRef, useState } from "react";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type AnimateLayoutChanges,
  type NewIndexGetter,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { Item } from "../components/Item";
import type { ItemProps } from "../components/Item/Item";
import { List } from "../components/List";
import { Wrapper } from "../components/Wrapper";
import type { Props } from "../types";
import { createRange } from "../utilities";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export function Sortable({
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  Container = List,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  itemCount = 16,
  items: initialItems,

  isDisabled = () => false,
  measuring,
  modifiers,
  removable,
  renderItem,
  reorderItems = arrayMove,
  strategy = rectSortingStrategy,
  style,
  useDragOverlay = true,
  wrapperStyle = () => ({}),
  updateProductImagesOrder,
  itemsType,
}: Props) {
  const map = new Map();
  for (const item of initialItems) {
    map.set(item.id, item);
  }
  const [items, setItems] = useState<ItemProps[]>(
    () =>
      initialItems ??
      createRange<UniqueIdentifier>(itemCount, (index) => index + 1),
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: "auto",
      coordinateGetter,
    }),
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: UniqueIdentifier) =>
    items.findIndex((item) => item.id === id);

  const getPosition = (id: UniqueIdentifier) =>
    items.findIndex((item) => item.id === id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;
  const handleRemove = removable
    ? (id: UniqueIdentifier) => {
        console.log("actived remove", id);
        setItems((items) => items.filter((item) => item.id !== id));
      }
    : undefined;

  const announcements: Announcements = {
    onDragStart({ active: { id } }) {
      return `Picked up sortable item ${String(
        id,
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({ active, over }) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragCancel({ active: { id } }) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id,
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);
  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);
  console.log("items", items);

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragEnd={({ over }) => {
        setActiveId(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => {
              const reordered = reorderItems(items, activeIndex, overIndex);

              console.log("reordered <=====", reordered);
              if (
                itemsType === "images" &&
                updateProductImagesOrder !== undefined
              ) {
                const order: Record<string, number> = {};
                reordered.forEach((item, index) => {
                  order[item.id] = index;
                });
                updateProductImagesOrder({ order }).catch((err) =>
                  console.log(err),
                );
              }

              return reordered;
            });
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
      measuring={measuring}
      modifiers={modifiers}
    >
      <Wrapper style={style} center>
        <SortableContext items={items} strategy={strategy}>
          <Container>
            {items.map((value, index) => (
              <SortableItem
                key={value.id}
                id={value.id}
                handle={handle}
                index={index}
                style={getItemStyles}
                wrapperStyle={wrapperStyle}
                disabled={isDisabled(value.id)}
                // @ts-ignore
                renderItem={renderItem}
                onRemove={handleRemove}
                animateLayoutChanges={animateLayoutChanges}
                useDragOverlay={useDragOverlay}
                getNewIndex={getNewIndex}
                idMap={map}
              />
            ))}
          </Container>
        </SortableContext>
      </Wrapper>
      {useDragOverlay
        ? createPortal(
            <DragOverlay
              adjustScale={adjustScale}
              dropAnimation={dropAnimation}
            >
              {activeId ? (
                <Item
                  value={items[activeIndex]!.id}
                  handle={handle}
                  // @ts-ignore
                  renderItem={renderItem}
                  wrapperStyle={wrapperStyle({
                    active: { id: activeId },
                    index: activeIndex,
                    isDragging: true,
                    id: items[activeIndex]!.id,
                  })}
                  style={getItemStyles({
                    id: items[activeIndex]!.id,
                    index: activeIndex,
                    isSorting: activeId !== null,
                    isDragging: true,
                    overIndex: -1,
                    isDragOverlay: true,
                  })}
                  dragOverlay
                  idMap={map}
                />
              ) : null}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  );
}
interface SortableItemProps {
  animateLayoutChanges: AnimateLayoutChanges;
  disabled?: boolean;
  getNewIndex?: NewIndexGetter | undefined;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  style(values: any): React.CSSProperties;
  renderItem?(args: any): React.ReactElement;
  wrapperStyle: Props["wrapperStyle"];
  idMap: Map<UniqueIdentifier, ItemProps>;
}
export function SortableItem({
  disabled = false,
  animateLayoutChanges,
  getNewIndex,
  handle,
  id,
  index,
  onRemove,
  style,
  renderItem,
  useDragOverlay,
  idMap,
  wrapperStyle,
}: SortableItemProps) {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
    ...(getNewIndex && { getNewIndex }),
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      idMap={idMap}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef,
            }
          : undefined
      }
      renderItem={renderItem}
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex,
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      wrapperStyle={wrapperStyle?.({ index, isDragging, active, id })}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
    />
  );
}
