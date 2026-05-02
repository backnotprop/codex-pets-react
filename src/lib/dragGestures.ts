import { useCallback, useEffect, useRef } from "react";
import type {
  PetAction,
  PetDragDirection,
  PetDragGestureAnimationMap,
  PetDragGestureContext,
  PetDragGestureDirectionOptions,
  PetGestureAnimation,
  PetPosition
} from "./types";

const defaultMinimumDistance = 14;
const defaultAxisBias = 1.12;

export interface UsePetDragGestureAnimationsOptions<
  TAnimation extends string = string
> extends PetDragGestureDirectionOptions {
  enabled?: boolean;
  animations: PetDragGestureAnimationMap<TAnimation>;
  restAnimation?: TAnimation;
  restDelayMs?: number;
  onGestureAction: (
    action: PetAction<TAnimation>,
    context: PetDragGestureContext<TAnimation>
  ) => void;
}

export function getPetDragDirection(
  from: PetPosition,
  to: PetPosition,
  {
    minimumDistance = defaultMinimumDistance,
    axisBias = defaultAxisBias
  }: PetDragGestureDirectionOptions = {}
): PetDragDirection | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.hypot(dx, dy) < minimumDistance) {
    return null;
  }

  if (absX > absY * axisBias) {
    return dx < 0 ? "left" : "right";
  }

  if (absY > absX * axisBias) {
    return dy < 0 ? "up" : "down";
  }

  return null;
}

export function createPetGestureAnimationAction<TAnimation extends string>(
  animation: PetGestureAnimation<TAnimation>
): PetAction<TAnimation> {
  if (typeof animation === "string") {
    return { type: "animation.set", animation };
  }

  return animation;
}

export function usePetDragGestureAnimations<TAnimation extends string = string>({
  enabled = true,
  animations,
  restAnimation,
  restDelayMs = 140,
  minimumDistance = defaultMinimumDistance,
  axisBias = defaultAxisBias,
  onGestureAction
}: UsePetDragGestureAnimationsOptions<TAnimation>) {
  const originRef = useRef<PetPosition | null>(null);
  const directionRef = useRef<PetDragDirection | null>(null);
  const restTimeoutRef = useRef<number | null>(null);

  const clearRestTimeout = useCallback(() => {
    if (restTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(restTimeoutRef.current);
    restTimeoutRef.current = null;
  }, []);

  useEffect(() => clearRestTimeout, [clearRestTimeout]);

  return useCallback(
    (action: PetAction<TAnimation>) => {
      if (action.type === "drag.start") {
        clearRestTimeout();
        originRef.current = action.position ?? null;
        directionRef.current = null;
        return;
      }

      if (action.type === "drag.end") {
        clearRestTimeout();
        originRef.current = null;
        directionRef.current = null;

        if (!enabled || !restAnimation || typeof window === "undefined") {
          return;
        }

        restTimeoutRef.current = window.setTimeout(() => {
          restTimeoutRef.current = null;
          onGestureAction(
            {
              type: "animation.set",
              animation: restAnimation,
              source: "system"
            },
            { direction: null, sourceAction: action }
          );
        }, restDelayMs);
        return;
      }

      if (!enabled || action.type !== "drag.move") {
        return;
      }

      const origin = originRef.current;
      if (!origin) {
        originRef.current = action.position;
        return;
      }

      const direction = getPetDragDirection(origin, action.position, {
        axisBias,
        minimumDistance
      });

      if (!direction) {
        return;
      }

      originRef.current = action.position;

      if (direction === directionRef.current) {
        return;
      }

      directionRef.current = direction;

      const gestureAnimation = animations[direction];
      if (!gestureAnimation) {
        return;
      }

      onGestureAction(createPetGestureAnimationAction(gestureAnimation), {
        direction,
        sourceAction: action
      });
    },
    [
      animations,
      axisBias,
      clearRestTimeout,
      enabled,
      minimumDistance,
      onGestureAction,
      restAnimation,
      restDelayMs
    ]
  );
}
