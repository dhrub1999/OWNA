import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Integration tests run against a real Supabase project.
 *
 * They are a separate config because they are slow, they need credentials, and
 * they create real users — none of which belongs in the suite that runs on
 * every save.
 */
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Two suites creating users against one project would collide.
    fileParallelism: false,
  },
});
