import { createCodexPetAnimator } from "./animator.js";
import type { CodexPetElement, CreateCodexPetElementOptions } from "./types.js";

export function createCodexPetElement(
  options: CreateCodexPetElementOptions
): CodexPetElement {
  const element = document.createElement("div");

  if (options.className) {
    element.className = options.className;
  }

  if (options.ariaLabel) {
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", options.ariaLabel);
  } else {
    element.setAttribute("aria-hidden", "true");
  }

  return {
    element,
    animator: createCodexPetAnimator(element, options)
  };
}
