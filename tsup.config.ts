import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: false,
  entry: {
    "index": "src/class/prayer-times.ts",
    "misc": "src/types/prayer-times.ts",
  },
  format: ["esm"],
  sourcemap: false,
  minify: true,
  target: "esnext",
  outDir: "dist",
  treeshake: true,
})
