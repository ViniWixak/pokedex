import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/docs/**", "src/server.ts", "src/app.ts"],
    },
  },
});
