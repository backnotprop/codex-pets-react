import { useEffect, useMemo, useRef, useState } from "react";
import { normalizePetAnimation } from "./animation";
import type { SpriteAnimatorProps } from "./types";

export function SpriteAnimator<TAnimation extends string>({
  src,
  atlas,
  animation,
  scale = 1,
  paused = false,
  className,
  style,
  ariaLabel,
  imageRendering = "auto",
  onAnimationComplete
}: SpriteAnimatorProps<TAnimation>) {
  const [frame, setFrame] = useState(0);
  const completedRef = useRef(false);
  const animationState = useMemo(
    () => normalizePetAnimation(animation),
    [animation]
  );
  const definition = atlas.animations[animationState.name];

  useEffect(() => {
    completedRef.current = false;
    setFrame(0);
  }, [animationState.mode, animationState.name, animationState.then]);

  useEffect(() => {
    if (paused || !definition || completedRef.current) {
      return;
    }

    const duration =
      definition.frameDurations[frame] ??
      definition.frameDurations[definition.frameDurations.length - 1] ??
      150;

    const timeout = window.setTimeout(() => {
      const nextFrame = frame + 1;

      if (nextFrame >= definition.frames) {
        if (animationState.mode === "once") {
          completedRef.current = true;
          setFrame(Math.max(0, definition.frames - 1));
          onAnimationComplete?.(animationState.name);
          return;
        }

        setFrame(0);
        return;
      }

      setFrame(nextFrame);
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [
    animationState.mode,
    animationState.name,
    definition,
    frame,
    onAnimationComplete,
    paused
  ]);

  if (!definition) {
    return null;
  }

  const width = atlas.cellWidth * scale;
  const height = atlas.cellHeight * scale;
  const backgroundWidth = atlas.columns * width;
  const backgroundHeight = atlas.rows * height;

  return (
    <div
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={className}
      role={ariaLabel ? "img" : undefined}
      style={{
        width,
        height,
        backgroundImage: `url("${src}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${backgroundWidth}px ${backgroundHeight}px`,
        backgroundPosition: `${-frame * width}px ${-definition.row * height}px`,
        imageRendering,
        ...style
      }}
    />
  );
}
