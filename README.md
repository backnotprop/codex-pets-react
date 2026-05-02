# Codex Pets React

Declarative React components and state helpers for Codex pet spritesheets.

Brought to you by [Plannotator](https://github.com/backnotprop/plannotator), the review service for agent work: use it before an agent starts to sharpen plans, and after an agent finishes to review code.

The package includes:

- `SpriteAnimator` for atlas row/frame playback.
- `PetWidget` for fixed-position rendering, dragging, pinning, and animation completion events.
- `petReducer` and `usePetController` for state-driven app integration.
- A Tater atlas preset that matches the packaged Codex pet asset.

## Install

```bash
npm install codex-pets-react
```

## Example App

The plannotator pet playground lives in `examples/plannotator-pet`.

```bash
npm install
npm run dev
```

The example loads Tater from `/pets/tater/spritesheet.webp`, exposes animation actions, screen pinning, dragging, a simulation toggle, automatic waiting, frame pausing, nudging, scaling, and a live state/event view.

## Importing Codex Pets

Codex pets live on your machine under:

```text
~/.codex/pets/<pet-id>/
├── pet.json
└── spritesheet.webp
```

For example, the included playground uses:

```text
/Users/ramos/.codex/pets/tater/
├── pet.json
└── spritesheet.webp
```

To use one in a web app, copy the pet folder into your app's public assets and pass the public spritesheet URL to `PetWidget`:

```bash
mkdir -p public/pets/tater
cp ~/.codex/pets/tater/pet.json public/pets/tater/pet.json
cp ~/.codex/pets/tater/spritesheet.webp public/pets/tater/spritesheet.webp
```

Then render it with the matching atlas:

```tsx
<PetWidget
  src="/pets/tater/spritesheet.webp"
  atlas={taterAtlas}
  animation={pet.animation}
  position={pet.position}
  pin={pet.pin}
  draggable
  onAction={petDispatch}
/>
```

The `pet.json` file identifies the pet and its spritesheet path. The React wrapper needs the browser-accessible `src` plus an atlas definition that describes the grid, frame rows, and frame durations.

## Usage

```tsx
import {
  PetWidget,
  taterAtlas,
  usePetController,
  type TaterAnimationName
} from "codex-pets-react";

export function PetLayer() {
  const { pet, petDispatch } = usePetController<TaterAnimationName>({
    initialState: {
      animation: { name: "idle", mode: "loop" },
      pin: "bottom-right"
    },
    defaultAnimation: "idle",
    waitingAnimation: "waiting",
    waitingAfterMs: 6000
  });

  return (
    <PetWidget
      src="/pets/tater/spritesheet.webp"
      atlas={taterAtlas}
      animation={pet.animation}
      position={pet.position}
      pin={pet.pin}
      draggable
      onAction={petDispatch}
    />
  );
}
```

Dispatch actions to drive the pet from app state:

```ts
petDispatch({
  type: "animation.play",
  animation: "waving",
  mode: "once",
  then: "idle"
});

petDispatch({ type: "pin.set", pin: "bottom-right" });
petDispatch({ type: "position.set", position: { x: 240, y: 420 } });
petDispatch({ type: "animation.set", animation: "waiting" });
```

## Drag Gesture Animations

Keep gesture animation opt-in by observing pet actions and dispatching follow-up animation actions:

```tsx
const observeDragGesture = usePetDragGestureAnimations<TaterAnimationName>({
  enabled: true,
  animations: {
    left: "running-left",
    right: "running-right",
    up: "jumping",
    down: "waving"
  },
  restAnimation: "idle",
  minimumDistance: 16,
  axisBias: 1.12,
  onGestureAction: petDispatch
});

const onAction = (action: PetAction<TaterAnimationName>) => {
  petDispatch(action);
  observeDragGesture(action);
};
```

`minimumDistance` filters pointer jitter. `axisBias` requires one axis to clearly dominate before changing animations, so diagonal or shaky drags do not flicker between states.

## Build

```bash
npm run build
```

This typechecks the repo, emits library declarations to `dist/types`, builds the library to `dist/lib`, and builds the example to `dist/examples/plannotator-pet`.
