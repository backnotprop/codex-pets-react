# codex-pets-react

React wrapper for Codex pet spritesheets.

## Install

```bash
npm install codex-pets-react codex-pets-core
```

`react` is a peer dependency.

## Basic Usage

```tsx
import { CodexPet } from "codex-pets-react";

export function PetPreview() {
  return (
    <CodexPet
      spritesheetUrl="/pets/vertical/spritesheet.webp"
      state="idle"
      scale={2}
    />
  );
}
```

## Controlled State

```tsx
<CodexPet
  spritesheetUrl="/pets/vertical/spritesheet.webp"
  state={isLoading ? "running" : "idle"}
/>
```

## Temporary Actions

Use a ref for short-lived actions. Props remain the persistent source of truth.

```tsx
import { useRef } from "react";
import { CodexPet, type CodexPetHandle } from "codex-pets-react";

export function ActionPet() {
  const pet = useRef<CodexPetHandle>(null);

  return (
    <CodexPet
      ref={pet}
      spritesheetUrl="/pets/vertical/spritesheet.webp"
      state="idle"
      onClick={() => pet.current?.play("waving", { loops: 1 })}
      onAnimationEnd={({ state }) => console.log(`${state} finished`)}
    />
  );
}
```

The component does not re-render every animation frame. It mounts one DOM node
and lets `codex-pets-core` update background position directly.

## Accessibility

Pets are decorative by default. Add `aria-label` when a pet is meaningful:

```tsx
<CodexPet
  aria-label="Vertical pet"
  spritesheetUrl="/pets/vertical/spritesheet.webp"
/>
```
