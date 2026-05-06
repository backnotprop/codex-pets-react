import {
  createCodexPetAnimator,
  type CodexPetAnimationEvent,
  type CodexPetAnimator,
  type CodexPetErrorEvent,
  type CodexPetManifest,
  type CodexPetPlayOptions,
  type CodexPetState,
  type CodexPetStateChangeEvent,
  type ReducedMotionPreference
} from "codex-pets-core";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type HTMLAttributes
} from "react";
import { useLatest } from "./useLatest";

type NativeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "children"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onError"
>;

export interface CodexPetHandle {
  play(state: CodexPetState, options?: CodexPetPlayOptions): void;
  setState(state: CodexPetState): void;
  pause(): void;
  resume(): void;
  getState(): CodexPetState;
  getBaseState(): CodexPetState;
}

export interface CodexPetProps extends NativeDivProps {
  manifest?: CodexPetManifest;
  spritesheetUrl: string;
  state?: CodexPetState;
  scale?: number;
  fps?: number;
  paused?: boolean;
  reducedMotion?: ReducedMotionPreference;
  imageRendering?: CSSProperties["imageRendering"];
  preload?: boolean;
  onReady?: () => void;
  onError?: (event: CodexPetErrorEvent) => void;
  onStateChange?: (event: CodexPetStateChangeEvent) => void;
  onAnimationStart?: (event: CodexPetAnimationEvent) => void;
  onAnimationLoop?: (event: CodexPetAnimationEvent) => void;
  onAnimationEnd?: (event: CodexPetAnimationEvent) => void;
  onFrameChange?: (event: CodexPetAnimationEvent) => void;
}

export const CodexPet = forwardRef<CodexPetHandle, CodexPetProps>(
  function CodexPet(
    {
      manifest,
      spritesheetUrl,
      state = "idle",
      scale = 1,
      fps = 8,
      paused = false,
      reducedMotion = "user-preference",
      imageRendering = "pixelated",
      preload = true,
      onReady,
      onError,
      onStateChange,
      onAnimationStart,
      onAnimationLoop,
      onAnimationEnd,
      onFrameChange,
      className,
      style,
      role,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      ...divProps
    },
    ref
  ) {
    const elementRef = useRef<HTMLDivElement>(null);
    const animatorRef = useRef<CodexPetAnimator | null>(null);
    const callbacksRef = useLatest({
      onReady,
      onError,
      onStateChange,
      onAnimationStart,
      onAnimationLoop,
      onAnimationEnd,
      onFrameChange
    });

    useEffect(() => {
      const element = elementRef.current;
      if (!element) {
        return;
      }

      const animator = createCodexPetAnimator(element, {
        spritesheetUrl,
        state,
        scale,
        fps,
        paused,
        reducedMotion,
        imageRendering: String(imageRendering),
        preload,
        onReady: () => callbacksRef.current.onReady?.(),
        onError: (event: CodexPetErrorEvent) =>
          callbacksRef.current.onError?.(event),
        onStateChange: (event: CodexPetStateChangeEvent) =>
          callbacksRef.current.onStateChange?.(event),
        onAnimationStart: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationStart?.(event),
        onAnimationLoop: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationLoop?.(event),
        onAnimationEnd: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onAnimationEnd?.(event),
        onFrameChange: (event: CodexPetAnimationEvent) =>
          callbacksRef.current.onFrameChange?.(event)
      });

      animatorRef.current = animator;

      return () => {
        animator.destroy();
        if (animatorRef.current === animator) {
          animatorRef.current = null;
        }
      };
    }, []);

    useEffect(() => {
      animatorRef.current?.setBaseState(state);
    }, [state]);

    useEffect(() => {
      animatorRef.current?.setSpritesheetUrl(spritesheetUrl);
    }, [spritesheetUrl]);

    useEffect(() => {
      animatorRef.current?.setScale(scale);
    }, [scale]);

    useEffect(() => {
      animatorRef.current?.setFps(fps);
    }, [fps]);

    useEffect(() => {
      animatorRef.current?.setPaused(paused);
    }, [paused]);

    useEffect(() => {
      animatorRef.current?.setReducedMotion(reducedMotion);
    }, [reducedMotion]);

    useEffect(() => {
      animatorRef.current?.setImageRendering(String(imageRendering));
    }, [imageRendering]);

    useImperativeHandle(
      ref,
      () => ({
        play: (nextState, options) => {
          animatorRef.current?.play(nextState, options);
        },
        setState: (nextState) => {
          animatorRef.current?.setBaseState(nextState);
        },
        pause: () => {
          animatorRef.current?.pause();
        },
        resume: () => {
          animatorRef.current?.resume();
        },
        getState: () => animatorRef.current?.getState() ?? state,
        getBaseState: () => animatorRef.current?.getBaseState() ?? state
      }),
      [state]
    );

    const accessibleRole = ariaLabel ? role ?? "img" : role;
    const accessibleHidden =
      ariaHidden ?? (ariaLabel ? undefined : true);

    return (
      <div
        {...divProps}
        aria-hidden={accessibleHidden}
        aria-label={ariaLabel}
        className={className}
        data-codex-pet={manifest?.id ?? ""}
        ref={elementRef}
        role={accessibleRole}
        style={style}
      />
    );
  }
);
