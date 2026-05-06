import {
  createCodexPetAnimator,
  createCodexPetElement,
  preloadPet
} from "../src/index";

describe("Codex pet animator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a pet element with the expected accessible defaults", () => {
    const { element, animator } = createCodexPetElement({
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "idle",
      scale: 1.5,
      paused: true
    });

    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.style.width).toBe("288px");
    expect(element.style.height).toBe("312px");
    expect(element.style.backgroundPosition).toBe("0px 0px");

    animator.destroy();
  });

  it("plays a temporary action and returns to the base state", () => {
    const element = document.createElement("div");
    const events: string[] = [];
    const animator = createCodexPetAnimator(element, {
      spritesheetUrl: "/pets/vertical/spritesheet.webp",
      state: "running",
      fps: 10,
      onAnimationStart: ({ state }) => events.push(`start:${state}`),
      onAnimationLoop: ({ state, loop }) => events.push(`loop:${state}:${loop}`),
      onAnimationEnd: ({ state }) => events.push(`end:${state}`),
      onStateChange: ({ state }) => events.push(`state:${state}`)
    });

    animator.play("waving", { loops: 1 });

    expect(animator.getState()).toBe("waving");
    expect(events).toContain("start:waving");

    vi.advanceTimersByTime(500);

    expect(animator.getState()).toBe("running");
    expect(events).toContain("loop:waving:1");
    expect(events).toContain("end:waving");
    expect(events).toContain("state:running");

    animator.destroy();
  });

  it("caches image preloads by URL", () => {
    const first = preloadPet("/pets/vertical/spritesheet.webp");
    const second = preloadPet("/pets/vertical/spritesheet.webp");

    expect(first).toBe(second);
  });
});
