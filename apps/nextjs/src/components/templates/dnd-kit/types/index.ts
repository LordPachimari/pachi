import type {
  Active,
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  Modifiers,
  PointerActivationConstraint,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type React from "react";


import type { ItemProps } from "../components/Item/Item";

export interface Props {
  activationConstraint: PointerActivationConstraint;
  animateLayoutChanges: AnimateLayoutChanges;
  adjustScale?: boolean | undefined;
  collisionDetection?: CollisionDetection | undefined;
  coordinateGetter?: KeyboardCoordinateGetter | undefined;
  Container?: any; // To-do: Fix me
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items: ItemProps[];
  measuring: MeasuringConfiguration;
  modifiers: Modifiers;
  renderItem?: unknown;
  removable?: boolean | undefined;
  reorderItems?: typeof arrayMove | undefined;
  strategy?: SortingStrategy | undefined;
  style: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, "id"> | null;
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
  updateImagesOrder?: ({
    order,
  }: {
    order: Record<string, number>;
  }) => Promise<void>;
  itemsType: "images";
}
