import type { PetAnimationInput, PetAnimationState } from "./types";

export function normalizePetAnimation<TAnimation extends string>(
  animation: PetAnimationInput<TAnimation>
): PetAnimationState<TAnimation> {
  if (typeof animation === "string") {
    return { name: animation, mode: "loop" };
  }

  return {
    name: animation.name,
    mode: animation.mode ?? "loop",
    then: animation.then
  };
}
