import type { PetSpriteAtlas } from "./types";

export const taterAtlas = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208,
  animations: {
    idle: {
      row: 0,
      frames: 6,
      frameDurations: [280, 110, 110, 140, 140, 320]
    },
    "running-right": {
      row: 1,
      frames: 8,
      frameDurations: [120, 120, 120, 120, 120, 120, 120, 220]
    },
    "running-left": {
      row: 2,
      frames: 8,
      frameDurations: [120, 120, 120, 120, 120, 120, 120, 220]
    },
    waving: {
      row: 3,
      frames: 4,
      frameDurations: [140, 140, 140, 280]
    },
    jumping: {
      row: 4,
      frames: 5,
      frameDurations: [140, 140, 140, 140, 280]
    },
    failed: {
      row: 5,
      frames: 8,
      frameDurations: [140, 140, 140, 140, 140, 140, 140, 240]
    },
    waiting: {
      row: 6,
      frames: 6,
      frameDurations: [150, 150, 150, 150, 150, 260]
    },
    running: {
      row: 7,
      frames: 6,
      frameDurations: [120, 120, 120, 120, 120, 220]
    },
    review: {
      row: 8,
      frames: 6,
      frameDurations: [150, 150, 150, 150, 150, 280]
    }
  }
} as const satisfies PetSpriteAtlas<string>;

export type TaterAnimationName = keyof typeof taterAtlas.animations;

export const taterPet = {
  id: "tater",
  displayName: "Tater",
  description:
    "A cheerful potato mascot with oversized translucent visor goggles, a glowing red stylus in one hand, soft pale limbs, and chunky futuristic sneakers, simplified into the Codex digital pet style.",
  spritesheetPath: "spritesheet.webp"
} as const;

export const taterSpritesheetUrl = "/pets/tater/spritesheet.webp";
