import { CODEX_PET_ATLAS, CODEX_PET_STATES } from "./constants";
import type {
  CodexPetFrame,
  CodexPetFrameStyle,
  CodexPetState,
  GetPetFrameOptions,
  GetPetFrameStyleOptions
} from "./types";

const MIN_SCALE = 0.1;
const MAX_SCALE = 16;

export function isCodexPetState(value: string): value is CodexPetState {
  return Object.prototype.hasOwnProperty.call(CODEX_PET_STATES, value);
}

export function normalizePetScale(scale = 1): number {
  if (!Number.isFinite(scale)) {
    return 1;
  }

  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
}

export function normalizePetFrame(frame = 0, frames: number): number {
  if (!Number.isFinite(frame) || frames <= 0) {
    return 0;
  }

  const integerFrame = Math.trunc(frame);
  return ((integerFrame % frames) + frames) % frames;
}

export function getPetFrame({
  state,
  frame = 0
}: GetPetFrameOptions): CodexPetFrame {
  const config = CODEX_PET_STATES[state];
  const normalizedFrame = normalizePetFrame(frame, config.frames);

  return {
    state,
    row: config.row,
    frame: normalizedFrame,
    frames: config.frames
  };
}

export function getPetFrameStyle({
  spritesheetUrl,
  state,
  frame = 0,
  scale = 1,
  imageRendering = "pixelated"
}: GetPetFrameStyleOptions): CodexPetFrameStyle {
  const normalizedScale = normalizePetScale(scale);
  const petFrame = getPetFrame({ state, frame });
  const cellWidth = CODEX_PET_ATLAS.cellWidth * normalizedScale;
  const cellHeight = CODEX_PET_ATLAS.cellHeight * normalizedScale;

  return {
    width: `${cellWidth}px`,
    height: `${cellHeight}px`,
    backgroundImage: `url("${spritesheetUrl}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${CODEX_PET_ATLAS.width * normalizedScale}px ${
      CODEX_PET_ATLAS.height * normalizedScale
    }px`,
    backgroundPosition: `${-petFrame.frame * cellWidth}px ${
      -petFrame.row * cellHeight
    }px`,
    imageRendering
  };
}
