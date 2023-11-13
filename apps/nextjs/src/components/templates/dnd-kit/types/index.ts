import React from "react";
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
  arrayMove,
  NewIndexGetter,
  SortingStrategy,
} from "@dnd-kit/sortable";

import type { Image } from "@pachi/db";

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
  items: (Image & { id: string })[];
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
  updateProductImagesOrder?: (images: Image[]) => void;
  itemsType: "images";
}