import type { CSSProperties } from "react";

export type PetAnimationMode = "loop" | "once";

export type PetActionSource = "user" | "system";

export interface PetFrameAnimation {
  row: number;
  frames: number;
  frameDurations: readonly number[];
}

export interface PetSpriteAtlas<TAnimation extends string = string> {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  animations: Record<TAnimation, PetFrameAnimation>;
}

export interface PetAnimationState<TAnimation extends string = string> {
  name: TAnimation;
  mode: PetAnimationMode;
  then?: TAnimation;
}

export type PetAnimationInput<TAnimation extends string = string> =
  | TAnimation
  | PetAnimationState<TAnimation>;

export interface PetPosition {
  x: number;
  y: number;
}

export type PetPin =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export interface PetBoundsPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type PetBoundsPaddingInput = number | Partial<PetBoundsPadding>;

export interface PetState<TAnimation extends string = string> {
  animation: PetAnimationState<TAnimation>;
  position: PetPosition;
  pin: PetPin | null;
  isDragging: boolean;
  lastInteractionAt: number;
}

export type PetAction<TAnimation extends string = string> =
  | {
      type: "animation.set";
      animation: TAnimation;
      source?: PetActionSource;
    }
  | {
      type: "animation.play";
      animation: TAnimation;
      mode?: PetAnimationMode;
      then?: TAnimation;
      source?: PetActionSource;
    }
  | {
      type: "animation.complete";
      animation?: TAnimation;
    }
  | {
      type: "position.set";
      position: PetPosition;
    }
  | {
      type: "pin.set";
      pin: PetPin;
    }
  | {
      type: "pin.clear";
    }
  | {
      type: "drag.start";
      position?: PetPosition;
    }
  | {
      type: "drag.move";
      position: PetPosition;
    }
  | {
      type: "drag.end";
      position: PetPosition;
    }
  | {
      type: "state.reset";
      state?: Partial<PetState<TAnimation>>;
    };

export interface SpriteAnimatorProps<TAnimation extends string = string> {
  src: string;
  atlas: PetSpriteAtlas<TAnimation>;
  animation: PetAnimationInput<TAnimation>;
  scale?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  imageRendering?: CSSProperties["imageRendering"];
  onAnimationComplete?: (animation: TAnimation) => void;
}

export type PetDragDirection = "left" | "right" | "up" | "down";

export type PetGestureAnimation<TAnimation extends string = string> =
  | TAnimation
  | {
      type: "animation.set";
      animation: TAnimation;
      source?: PetActionSource;
    }
  | {
      type: "animation.play";
      animation: TAnimation;
      mode?: PetAnimationMode;
      then?: TAnimation;
      source?: PetActionSource;
    };

export type PetDragGestureAnimationMap<TAnimation extends string = string> =
  Partial<Record<PetDragDirection, PetGestureAnimation<TAnimation>>>;

export interface PetDragGestureDirectionOptions {
  minimumDistance?: number;
  axisBias?: number;
}

export interface PetDragGestureContext<TAnimation extends string = string> {
  direction: PetDragDirection | null;
  sourceAction: PetAction<TAnimation>;
}

export interface PetWidgetProps<TAnimation extends string = string> {
  src: string;
  atlas: PetSpriteAtlas<TAnimation>;
  animation: PetAnimationInput<TAnimation>;
  position?: PetPosition;
  pin?: PetPin | null;
  draggable?: boolean;
  scale?: number;
  boundsPadding?: PetBoundsPaddingInput;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  imageRendering?: CSSProperties["imageRendering"];
  paused?: boolean;
  onAction?: (action: PetAction<TAnimation>) => void;
  onAnimationComplete?: (animation: TAnimation) => void;
}
