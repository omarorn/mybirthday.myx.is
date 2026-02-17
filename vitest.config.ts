import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["**/*.html"],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
