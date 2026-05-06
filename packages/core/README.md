# codex-pets-core

Dependency-free TypeScript engine for Codex pet spritesheets.

## Install

```bash
npm install codex-pets-core
```

## Basic DOM Usage

```ts
import { createCodexPetElement } from "codex-pets-core";

const { element, animator } = createCodexPetElement({
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "idle",
  scale: 2
});

document.body.append(element);
animator.play("waving", { loops: 1 });
```

## Pure Frame Math

```ts
import { getPetFrameStyle } from "codex-pets-core";

const style = getPetFrameStyle({
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "review",
  frame: 2,
  scale: 2
});
```

## Animator API

```ts
const animator = createCodexPetAnimator(element, {
  spritesheetUrl: "/pets/vertical/spritesheet.webp",
  state: "idle",
  fps: 8,
  onAnimationEnd: ({ state }) => console.log(state)
});

animator.setBaseState("running");
animator.play("jumping", { loops: 1 });
animator.pause();
animator.resume();
animator.destroy();
```

The core animator uses a shared scheduler, so multiple pets share one animation
clock instead of creating one timer per pet.

## Accessibility

`createCodexPetElement` marks pets as decorative by default with
`aria-hidden="true"`. Pass `ariaLabel` when the pet communicates meaningful
information.
