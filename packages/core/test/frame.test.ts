import {
  CODEX_PET_ATLAS,
  CODEX_PET_STATES,
  getPetFrame,
  getPetFrameStyle,
  isCodexPetState
} from "../src/index";

describe("Codex pet frame contract", () => {
  it("describes the fixed Codex pet atlas", () => {
    expect(CODEX_PET_ATLAS).toEqual({
      columns: 8,
      rows: 9,
      cellWidth: 192,
      cellHeight: 208,
      width: 1536,
      height: 1872
    });
    expect(CODEX_PET_STATES["running-left"]).toEqual({ row: 2, frames: 8 });
  });

  it("wraps frame indexes inside the configured state frame count", () => {
    expect(getPetFrame({ state: "waving", frame: 6 })).toEqual({
      state: "waving",
      row: 3,
      frame: 2,
      frames: 4
    });
  });

  it("calculates scaled CSS background styles", () => {
    expect(
      getPetFrameStyle({
        spritesheetUrl: "/pets/vertical/spritesheet.webp",
        state: "review",
        frame: 5,
        scale: 2
      })
    ).toMatchObject({
      width: "384px",
      height: "416px",
      backgroundImage: 'url("/pets/vertical/spritesheet.webp")',
      backgroundSize: "3072px 3744px",
      backgroundPosition: "-1920px -3328px",
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated"
    });
  });

  it("checks state names at runtime", () => {
    expect(isCodexPetState("idle")).toBe(true);
    expect(isCodexPetState("sleeping")).toBe(false);
  });
});
