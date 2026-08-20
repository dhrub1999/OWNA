import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      // next/font runs inside the Next compiler and downloads font files at
      // build time; under Vitest it has no compiler to run in. The stub returns
      // the same shape the loaders do, which is all lib/themes/fonts.ts uses.
      "next/font/google": path.resolve(import.meta.dirname, "tests/stubs/next-font-google.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    globals: false,
  },
});
