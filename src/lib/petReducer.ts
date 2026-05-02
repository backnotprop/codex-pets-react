import type { PetAction, PetAnimationState, PetState } from "./types";

const defaultAnimation = "idle";

export function createPetState<TAnimation extends string>(
  overrides: Partial<PetState<TAnimation>> = {}
): PetState<TAnimation> {
  const animation =
    overrides.animation ??
    ({
      name: defaultAnimation as TAnimation,
      mode: "loop"
    } satisfies PetAnimationState<TAnimation>);

  return {
    animation,
    position: overrides.position ?? { x: 24, y: 24 },
    pin: overrides.pin ?? "bottom-right",
    isDragging: overrides.isDragging ?? false,
    lastInteractionAt: overrides.lastInteractionAt ?? Date.now()
  };
}

function shouldMarkInteraction<TAnimation extends string>(
  action: PetAction<TAnimation>
) {
  if (action.type === "animation.complete") {
    return false;
  }

  if (
    (action.type === "animation.set" || action.type === "animation.play") &&
    action.source === "system"
  ) {
    return false;
  }

  return true;
}

function withInteractionTime<TAnimation extends string>(
  state: PetState<TAnimation>,
  action: PetAction<TAnimation>
): PetState<TAnimation> {
  if (!shouldMarkInteraction(action)) {
    return state;
  }

  return {
    ...state,
    lastInteractionAt: Date.now()
  };
}

export function petReducer<TAnimation extends string>(
  state: PetState<TAnimation>,
  action: PetAction<TAnimation>
): PetState<TAnimation> {
  let next = state;

  switch (action.type) {
    case "animation.set":
      next = {
        ...state,
        animation: { name: action.animation, mode: "loop" }
      };
      break;
    case "animation.play":
      next = {
        ...state,
        animation: {
          name: action.animation,
          mode: action.mode ?? "loop",
          then: action.then
        }
      };
      break;
    case "animation.complete":
      if (
        state.animation.mode !== "once" ||
        (action.animation && action.animation !== state.animation.name)
      ) {
        next = state;
        break;
      }

      next = {
        ...state,
        animation: {
          name: state.animation.then ?? state.animation.name,
          mode: "loop"
        }
      };
      break;
    case "position.set":
      next = {
        ...state,
        position: action.position,
        pin: null
      };
      break;
    case "pin.set":
      next = {
        ...state,
        pin: action.pin
      };
      break;
    case "pin.clear":
      next = {
        ...state,
        pin: null
      };
      break;
    case "drag.start":
      next = {
        ...state,
        isDragging: true,
        pin: null
      };
      break;
    case "drag.move":
      next = {
        ...state,
        position: action.position,
        pin: null
      };
      break;
    case "drag.end":
      next = {
        ...state,
        isDragging: false,
        position: action.position,
        pin: null
      };
      break;
    case "state.reset":
      next = createPetState(action.state);
      break;
  }

  return withInteractionTime(next, action);
}
