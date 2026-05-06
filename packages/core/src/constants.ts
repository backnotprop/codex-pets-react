import type { CodexPetAtlas, CodexPetStateConfig } from "./types";

export const CODEX_PET_ATLAS = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208,
  width: 1536,
  height: 1872
} as const satisfies CodexPetAtlas;

export const CODEX_PET_STATES = {
  idle: { row: 0, frames: 6 },
  "running-right": { row: 1, frames: 8 },
  "running-left": { row: 2, frames: 8 },
  waving: { row: 3, frames: 4 },
  jumping: { row: 4, frames: 5 },
  failed: { row: 5, frames: 8 },
  waiting: { row: 6, frames: 6 },
  running: { row: 7, frames: 6 },
  review: { row: 8, frames: 6 }
} as const satisfies Record<string, CodexPetStateConfig>;
