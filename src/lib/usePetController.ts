import { useEffect, useReducer } from "react";
import { createPetState, petReducer } from "./petReducer";
import type { PetAction, PetState } from "./types";

export interface UsePetControllerOptions<TAnimation extends string = string> {
  initialState?: Partial<PetState<TAnimation>>;
  defaultAnimation?: TAnimation;
  waitingAnimation?: TAnimation;
  waitingAfterMs?: number;
}

export function usePetController<TAnimation extends string = string>({
  initialState,
  defaultAnimation,
  waitingAnimation,
  waitingAfterMs
}: UsePetControllerOptions<TAnimation> = {}) {
  const [pet, petDispatch] = useReducer(
    (state: PetState<TAnimation>, action: PetAction<TAnimation>) =>
      petReducer(state, action),
    undefined,
    () => createPetState(initialState)
  );

  useEffect(() => {
    if (!waitingAnimation || !waitingAfterMs || !defaultAnimation) {
      return;
    }

    if (
      pet.isDragging ||
      pet.animation.mode !== "loop" ||
      pet.animation.name !== defaultAnimation
    ) {
      return;
    }

    const elapsed = Date.now() - pet.lastInteractionAt;
    const delay = Math.max(0, waitingAfterMs - elapsed);

    const timeout = window.setTimeout(() => {
      petDispatch({
        type: "animation.set",
        animation: waitingAnimation,
        source: "system"
      });
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [
    defaultAnimation,
    pet.animation.mode,
    pet.animation.name,
    pet.isDragging,
    pet.lastInteractionAt,
    waitingAfterMs,
    waitingAnimation
  ]);

  return { pet, petDispatch } as const;
}
