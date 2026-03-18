import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/raumcontroller-card.ts",
  output: {
    file: "dist/raumcontroller-card.js",
    format: "es",
    sourcemap: true
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json"
    })
  ]
};

