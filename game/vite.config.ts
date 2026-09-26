import react from "@vitejs/plugin-react";
// defineConfig from vitest/config, not vite, so the `test` block typechecks.
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Node env, not jsdom: the render test uses renderToStaticMarkup, which needs no DOM.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
