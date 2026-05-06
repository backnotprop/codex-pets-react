import { act } from "react";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CodexPet, type CodexPetHandle } from "../src/index";
import type { CodexPetManifest } from "codex-pets-core";

const manifest: CodexPetManifest = {
  id: "vertical",
  displayName: "Vertical",
  description: "A desktop computer pet.",
  spritesheetPath: "spritesheet.webp"
};

function render(ui: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  let root: Root | null = null;

  act(() => {
    root = createRoot(host);
    root.render(ui);
  });

  return {
    host,
    rerender: (nextUi: ReactNode) =>
      act(() => {
        root?.render(nextUi);
      }),
    unmount: () =>
      act(() => {
        root?.unmount();
        host.remove();
      })
  };
}

describe("CodexPet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("renders a decorative pet and updates controlled state without React frame renders", () => {
    const { host, rerender, unmount } = render(
      <CodexPet
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="idle"
        paused
      />
    );

    const pet = host.querySelector("[data-codex-pet]");
    expect(pet).toBeInstanceOf(HTMLDivElement);
    expect(pet?.getAttribute("aria-hidden")).toBe("true");
    expect((pet as HTMLDivElement).style.backgroundPosition).toBe("0px 0px");

    rerender(
      <CodexPet
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="review"
        paused
      />
    );

    expect((pet as HTMLDivElement).style.backgroundPosition).toBe(
      "0px -1664px"
    );

    unmount();
  });

  it("exposes temporary actions through an imperative ref", () => {
    const ref = { current: null as CodexPetHandle | null };
    const events: string[] = [];
    const { host, unmount } = render(
      <CodexPet
        ref={ref}
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="running"
        fps={10}
        onAnimationEnd={({ state }) => events.push(`end:${state}`)}
        onStateChange={({ state }) => events.push(`state:${state}`)}
      />
    );

    act(() => {
      ref.current?.play("waving", { loops: 1 });
    });

    expect(ref.current?.getState()).toBe("waving");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(ref.current?.getState()).toBe("running");
    expect(events).toContain("end:waving");
    expect(events).toContain("state:running");
    expect(host.querySelector("[data-codex-pet]")).toBeInstanceOf(
      HTMLDivElement
    );

    unmount();
  });

  it("uses an accessible image role when aria-label is provided", () => {
    const { host, unmount } = render(
      <CodexPet
        aria-label="Vertical pet"
        manifest={manifest}
        spritesheetUrl="/pets/vertical/spritesheet.webp"
        state="idle"
        paused
      />
    );

    const pet = host.querySelector("[data-codex-pet]");
    expect(pet?.getAttribute("role")).toBe("img");
    expect(pet?.getAttribute("aria-label")).toBe("Vertical pet");

    unmount();
  });
});
