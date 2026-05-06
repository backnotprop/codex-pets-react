import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "codex-pets-core": new URL("../core/src/index.ts", import.meta.url)
        .pathname
    }
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"]
  }
});
