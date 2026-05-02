import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { SpriteAnimator } from "./SpriteAnimator";
import {
  clampPetPosition,
  getPinnedPetPosition,
  normalizeBoundsPadding,
  type PetViewport
} from "./positioning";
import type { PetPosition, PetWidgetProps } from "./types";

function getViewportSize(): PetViewport {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function useViewportSize() {
  const [viewport, setViewport] = useState(getViewportSize);

  useEffect(() => {
    const handleResize = () => setViewport(getViewportSize());
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return viewport;
}

export function PetWidget<TAnimation extends string>({
  src,
  atlas,
  animation,
  position,
  pin,
  draggable = false,
  scale = 1,
  boundsPadding,
  zIndex = 40,
  className,
  style,
  ariaLabel = "Animated pet",
  imageRendering,
  paused,
  onAction,
  onAnimationComplete
}: PetWidgetProps<TAnimation>) {
  const viewport = useViewportSize();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<PetPosition | null>(null);
  const dragOffsetRef = useRef<PetPosition>({ x: 0, y: 0 });
  const lastPositionRef = useRef<PetPosition | null>(null);

  const size = useMemo(
    () => ({
      width: atlas.cellWidth * scale,
      height: atlas.cellHeight * scale
    }),
    [atlas.cellHeight, atlas.cellWidth, scale]
  );
  const padding = useMemo(
    () => normalizeBoundsPadding(boundsPadding),
    [boundsPadding]
  );

  const pinnedPosition = useMemo(() => {
    if (!pin) {
      return null;
    }

    return getPinnedPetPosition(pin, size, viewport, padding);
  }, [padding, pin, size, viewport]);

  const controlledPosition = useMemo(() => {
    const next =
      dragPosition ??
      pinnedPosition ??
      position ??
      getPinnedPetPosition("bottom-right", size, viewport, padding);

    return clampPetPosition(next, size, viewport, padding);
  }, [dragPosition, padding, pinnedPosition, position, size, viewport]);

  useEffect(() => {
    if (!isDragging) {
      setDragPosition(null);
    }
  }, [isDragging, pin, position?.x, position?.y]);

  const emitComplete = useCallback(
    (name: TAnimation) => {
      onAction?.({ type: "animation.complete", animation: name });
      onAnimationComplete?.(name);
    },
    [onAction, onAnimationComplete]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggable || event.button !== 0) {
        return;
      }

      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const nextPosition = { x: rect.left, y: rect.top };

      dragOffsetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      lastPositionRef.current = nextPosition;
      setDragPosition(nextPosition);
      setIsDragging(true);
      onAction?.({ type: "drag.start", position: nextPosition });
    },
    [draggable, onAction]
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const getNextPosition = (event: PointerEvent) =>
      clampPetPosition(
        {
          x: event.clientX - dragOffsetRef.current.x,
          y: event.clientY - dragOffsetRef.current.y
        },
        size,
        viewport,
        padding
      );

    const handlePointerMove = (event: PointerEvent) => {
      const nextPosition = getNextPosition(event);
      lastPositionRef.current = nextPosition;
      setDragPosition(nextPosition);
      onAction?.({ type: "drag.move", position: nextPosition });
    };

    const handlePointerUp = (event: PointerEvent) => {
      const finalPosition = lastPositionRef.current ?? getNextPosition(event);
      setIsDragging(false);
      setDragPosition(finalPosition);
      onAction?.({ type: "drag.end", position: finalPosition });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    window.addEventListener("pointercancel", handlePointerUp, { once: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, onAction, padding, size, viewport]);

  return (
    <div
      className={className}
      onPointerDown={handlePointerDown}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex,
        width: size.width,
        height: size.height,
        transform: `translate3d(${controlledPosition.x}px, ${controlledPosition.y}px, 0)`,
        touchAction: "none",
        userSelect: "none",
        cursor: draggable ? (isDragging ? "grabbing" : "grab") : "default",
        willChange: "transform",
        ...style
      }}
    >
      <SpriteAnimator
        ariaLabel={ariaLabel}
        atlas={atlas}
        imageRendering={imageRendering}
        paused={paused}
        scale={scale}
        src={src}
        animation={animation}
        onAnimationComplete={emitComplete}
      />
    </div>
  );
}
