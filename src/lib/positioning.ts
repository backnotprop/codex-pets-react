import type {
  PetBoundsPadding,
  PetBoundsPaddingInput,
  PetPin,
  PetPosition
} from "./types";

export interface PetSize {
  width: number;
  height: number;
}

export interface PetViewport {
  width: number;
  height: number;
}

export function normalizeBoundsPadding(
  input: PetBoundsPaddingInput = 24
): PetBoundsPadding {
  if (typeof input === "number") {
    return { top: input, right: input, bottom: input, left: input };
  }

  return {
    top: input.top ?? 24,
    right: input.right ?? 24,
    bottom: input.bottom ?? 24,
    left: input.left ?? 24
  };
}

export function clampPetPosition(
  position: PetPosition,
  size: PetSize,
  viewport: PetViewport,
  padding: PetBoundsPadding
): PetPosition {
  const minX = padding.left;
  const minY = padding.top;
  const maxX = Math.max(minX, viewport.width - padding.right - size.width);
  const maxY = Math.max(minY, viewport.height - padding.bottom - size.height);

  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY)
  };
}

export function getPinnedPetPosition(
  pin: PetPin,
  size: PetSize,
  viewport: PetViewport,
  padding: PetBoundsPadding
): PetPosition {
  const minX = padding.left;
  const minY = padding.top;
  const maxX = Math.max(minX, viewport.width - padding.right - size.width);
  const maxY = Math.max(minY, viewport.height - padding.bottom - size.height);
  const centerX = minX + (maxX - minX) / 2;
  const centerY = minY + (maxY - minY) / 2;

  switch (pin) {
    case "top-left":
      return { x: minX, y: minY };
    case "top":
      return { x: centerX, y: minY };
    case "top-right":
      return { x: maxX, y: minY };
    case "left":
      return { x: minX, y: centerY };
    case "center":
      return { x: centerX, y: centerY };
    case "right":
      return { x: maxX, y: centerY };
    case "bottom-left":
      return { x: minX, y: maxY };
    case "bottom":
      return { x: centerX, y: maxY };
    case "bottom-right":
      return { x: maxX, y: maxY };
  }
}
