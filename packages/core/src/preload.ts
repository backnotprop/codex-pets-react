const preloadCache = new Map<string, Promise<HTMLImageElement>>();

function createImageLoadPromise(src: string): Promise<HTMLImageElement> {
  if (typeof Image === "undefined") {
    return Promise.reject(
      new Error("Image preloading is only available in a browser environment.")
    );
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Failed to preload Codex pet spritesheet: ${src}`));
    image.src = src;
  });
}

export function preloadPet(spritesheetUrl: string): Promise<HTMLImageElement> {
  const cached = preloadCache.get(spritesheetUrl);
  if (cached) {
    return cached;
  }

  const promise = createImageLoadPromise(spritesheetUrl);
  preloadCache.set(spritesheetUrl, promise);
  return promise;
}
