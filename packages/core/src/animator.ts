import { CODEX_PET_STATES } from "./constants";
import { getPetFrameStyle, normalizePetScale } from "./frame";
import { preloadPet } from "./preload";
import { codexPetScheduler, type ScheduledAnimator } from "./scheduler";
import type {
  CodexPetAnimationEvent,
  CodexPetAnimator,
  CodexPetAnimatorOptions,
  CodexPetPlayOptions,
  CodexPetState
} from "./types";

interface ActiveAction {
  state: CodexPetState;
  loops: number;
  returnTo?: CodexPetState;
}

const DEFAULT_STATE: CodexPetState = "idle";
const DEFAULT_FPS = 8;
const MIN_FPS = 1;
const MAX_FPS = 60;

function normalizeFps(fps = DEFAULT_FPS): number {
  if (!Number.isFinite(fps)) {
    return DEFAULT_FPS;
  }

  return Math.min(Math.max(fps, MIN_FPS), MAX_FPS);
}

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export class CodexPetAnimatorImpl
  implements CodexPetAnimator, ScheduledAnimator
{
  private readonly element: HTMLElement;
  private options: CodexPetAnimatorOptions;
  private baseState: CodexPetState;
  private activeAction: ActiveAction | null = null;
  private frame = 0;
  private loop = 0;
  private lastFrameAt: number | null = null;
  private paused: boolean;
  private destroyed = false;
  private scheduled = false;

  constructor(element: HTMLElement, options: CodexPetAnimatorOptions) {
    this.element = element;
    this.options = options;
    this.baseState = options.state ?? DEFAULT_STATE;
    this.paused = options.paused ?? false;

    this.applyBaseStyles();
    this.render();

    if (options.preload !== false) {
      preloadPet(options.spritesheetUrl)
        .then(() => options.onReady?.())
        .catch((error: unknown) => {
          options.onError?.({
            error: error instanceof Error ? error : new Error(String(error))
          });
        });
    }

    this.updateSchedule();
  }

  play(state: CodexPetState, options: CodexPetPlayOptions = {}): void {
    this.activeAction = {
      state,
      loops: Math.max(1, Math.trunc(options.loops ?? 1)),
      returnTo: options.returnTo
    };
    this.frame = 0;
    this.loop = 0;
    this.lastFrameAt = null;
    this.render();
    this.emitAnimationStart();
    this.emitStateChange(state, this.baseState);
    this.updateSchedule();
  }

  setBaseState(state: CodexPetState): void {
    const previousState = this.getState();
    this.baseState = state;

    if (!this.activeAction) {
      this.frame = 0;
      this.loop = 0;
      this.lastFrameAt = null;
      this.render();
      this.emitStateChange(state, previousState);
    }

    this.updateSchedule();
  }

  setSpritesheetUrl(spritesheetUrl: string): void {
    this.options = { ...this.options, spritesheetUrl };
    this.render();
  }

  setScale(scale: number): void {
    this.options = { ...this.options, scale: normalizePetScale(scale) };
    this.applyBaseStyles();
    this.render();
  }

  setFps(fps: number): void {
    this.options = { ...this.options, fps: normalizeFps(fps) };
  }

  setImageRendering(imageRendering: string): void {
    this.options = { ...this.options, imageRendering };
    this.render();
  }

  setReducedMotion(reducedMotion: CodexPetAnimatorOptions["reducedMotion"]): void {
    this.options = { ...this.options, reducedMotion };
    this.lastFrameAt = null;
    this.render();
    this.updateSchedule();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.lastFrameAt = null;
    this.updateSchedule();
  }

  pause(): void {
    this.setPaused(true);
  }

  resume(): void {
    this.setPaused(false);
  }

  getState(): CodexPetState {
    return this.activeAction?.state ?? this.baseState;
  }

  getBaseState(): CodexPetState {
    return this.baseState;
  }

  getFrame(): number {
    return this.frame;
  }

  tick(now: number): void {
    if (!this.shouldAnimate()) {
      return;
    }

    const frameDuration = 1000 / normalizeFps(this.options.fps);
    if (this.lastFrameAt === null) {
      this.lastFrameAt = now;
      return;
    }

    let elapsed = now - this.lastFrameAt;
    while (elapsed >= frameDuration && this.shouldAnimate()) {
      this.advanceFrame();
      this.lastFrameAt += frameDuration;
      elapsed -= frameDuration;
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.unschedule();
  }

  private advanceFrame(): void {
    const state = this.getState();
    const config = CODEX_PET_STATES[state];
    const nextFrame = this.frame + 1;

    if (nextFrame >= config.frames) {
      this.frame = 0;
      this.loop += 1;
      this.render();
      this.emitAnimationLoop();

      if (this.activeAction && this.loop >= this.activeAction.loops) {
        const completedState = this.activeAction.state;
        const returnTo = this.activeAction.returnTo;
        this.activeAction = null;

        if (returnTo) {
          this.baseState = returnTo;
        }

        this.frame = 0;
        this.loop = 0;
        this.render();
        this.emitAnimationEnd(completedState);
        this.emitStateChange(this.baseState, completedState);
      }

      return;
    }

    this.frame = nextFrame;
    this.render();
  }

  private shouldAnimate(): boolean {
    const reducedMotion = this.options.reducedMotion;
    const shouldReduce =
      reducedMotion === true ||
      (reducedMotion === "user-preference" && prefersReducedMotion());

    return !this.destroyed && !this.paused && !shouldReduce;
  }

  private updateSchedule(): void {
    if (this.shouldAnimate()) {
      this.schedule();
      return;
    }

    this.unschedule();
  }

  private schedule(): void {
    if (this.scheduled) {
      return;
    }

    this.scheduled = true;
    codexPetScheduler.add(this);
  }

  private unschedule(): void {
    if (!this.scheduled) {
      return;
    }

    this.scheduled = false;
    codexPetScheduler.remove(this);
  }

  private render(): void {
    const frameStyle = getPetFrameStyle({
      spritesheetUrl: this.options.spritesheetUrl,
      state: this.getState(),
      frame: this.frame,
      scale: this.options.scale,
      imageRendering: this.options.imageRendering
    });

    Object.assign(this.element.style, frameStyle);
    this.options.onFrameChange?.(this.getAnimationEvent());
  }

  private applyBaseStyles(): void {
    this.element.style.display = "inline-block";
    this.element.style.flex = "0 0 auto";
  }

  private getAnimationEvent(state = this.getState()): CodexPetAnimationEvent {
    return {
      state,
      frame: this.frame,
      loop: this.loop
    };
  }

  private emitAnimationStart(): void {
    this.options.onAnimationStart?.(this.getAnimationEvent());
  }

  private emitAnimationLoop(): void {
    this.options.onAnimationLoop?.(this.getAnimationEvent());
  }

  private emitAnimationEnd(state: CodexPetState): void {
    this.options.onAnimationEnd?.(this.getAnimationEvent(state));
  }

  private emitStateChange(
    state: CodexPetState,
    previousState: CodexPetState
  ): void {
    if (state === previousState) {
      return;
    }

    this.options.onStateChange?.({ state, previousState });
  }
}

export function createCodexPetAnimator(
  element: HTMLElement,
  options: CodexPetAnimatorOptions
): CodexPetAnimator {
  return new CodexPetAnimatorImpl(element, options);
}
