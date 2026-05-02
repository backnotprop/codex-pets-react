import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const exampleRoot = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  root: exampleRoot,
  plugins: [react()],
  server: {
    fs: {
      allow: [exampleRoot, workspaceRoot]
    }
  },
  build: {
    outDir: "../../dist/examples/plannotator-pet",
    emptyOutDir: true
  }
});
