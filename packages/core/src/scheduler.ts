export interface ScheduledAnimator {
  tick(now: number): void;
}

type FrameHandle =
  | ReturnType<typeof requestAnimationFrame>
  | ReturnType<typeof globalThis.setTimeout>;

const FRAME_DELAY_MS = 16;

function requestFrame(callback: (now: number) => void): FrameHandle {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }

  return globalThis.setTimeout(() => callback(performance.now()), FRAME_DELAY_MS);
}

function cancelFrame(handle: FrameHandle): void {
  if (typeof cancelAnimationFrame === "function" && typeof handle === "number") {
    cancelAnimationFrame(handle);
    return;
  }

  globalThis.clearTimeout(handle);
}

class CodexPetScheduler {
  private readonly animators = new Set<ScheduledAnimator>();
  private frameHandle: FrameHandle | null = null;

  add(animator: ScheduledAnimator): void {
    this.animators.add(animator);
    this.start();
  }

  remove(animator: ScheduledAnimator): void {
    this.animators.delete(animator);
    if (this.animators.size === 0) {
      this.stop();
    }
  }

  private start(): void {
    if (this.frameHandle !== null) {
      return;
    }

    this.frameHandle = requestFrame(this.tick);
  }

  private stop(): void {
    if (this.frameHandle === null) {
      return;
    }

    cancelFrame(this.frameHandle);
    this.frameHandle = null;
  }

  private readonly tick = (now: number): void => {
    this.frameHandle = null;

    for (const animator of this.animators) {
      animator.tick(now);
    }

    if (this.animators.size > 0) {
      this.start();
    }
  };
}

export const codexPetScheduler = new CodexPetScheduler();
