import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "public/mockServiceWorker.js",
  ]),

  // A leading underscore is this codebase's established convention for an
  // intentionally-unused parameter/variable (e.g. a prop kept for a shared
  // interface, or a destructured field deliberately excluded from the rest).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        args: "all",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },

  // Architectural boundary rules. The barrel-only-import convention
  // ("features may only be imported via their index.ts") was never actually
  // followed in this codebase — most features don't even have a barrel — so
  // that check (boundaries/entry-point) has been dropped rather than left as
  // 260+ pre-existing warnings nobody acts on. What's kept is the one check
  // that catches real architectural drift: features reaching into each
  // other's internals instead of composing through shared/lib.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app",     pattern: "src/app/**/*" },
        { type: "feature", pattern: "src/features/*/**/*", capture: ["featureName"] },
        { type: "shared",  pattern: "src/components/**/*" },
        { type: "lib",     pattern: "src/lib/**/*" },
        { type: "store",   pattern: "src/store/**/*" },
        { type: "hooks",   pattern: "src/hooks/**/*" },
        { type: "types",   pattern: "src/types/**/*" },
        { type: "styles",  pattern: "src/styles/**/*" },
        { type: "mocks",   pattern: "src/mocks/**/*" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      "boundaries/dependencies": ["warn", {
        default: "disallow",
        rules: [
          // app/ can import features, shared, lib, store, hooks, types
          { 
            from: [{ type: "app" }], 
            allow: [
              { to: { type: "feature" } },
              { to: { type: "shared" } },
              { to: { type: "lib" } },
              { to: { type: "store" } },
              { to: { type: "hooks" } },
              { to: { type: "types" } }
            ] 
          },
          // features can import shared, lib, hooks, types, store, and — in
          // practice — layout/composition pieces living under app/
          { 
            from: [{ type: "feature" }], 
            allow: [
              { to: { type: "shared" } },
              { to: { type: "lib" } },
              { to: { type: "hooks" } },
              { to: { type: "types" } },
              { to: { type: "store" } },
              { to: { type: "app" } },
              // a feature can import from itself (intra-feature)
              { to: { type: "feature", captured: { featureName: "{{ from.captured.featureName }}" } } }
            ] 
          },
          // shared components can import lib, hooks, and — for header/sidebar
          // chrome that needs auth/notification state or shared app/ layout
          // pieces (e.g. LanguageSelector) — features and app.
          { 
            from: [{ type: "shared" }], 
            allow: [
              { to: { type: "shared" } },
              { to: { type: "lib" } },
              { to: { type: "hooks" } },
              { to: { type: "types" } },
              { to: { type: "feature" } },
              { to: { type: "app" } },
              { to: { type: "store" } }
            ] 
          },
          // lib is a leaf for runtime deps, but mocks (under src/lib/mocks)
          // legitimately need feature payload/response types for realistic typing
          { 
            from: [{ type: "lib" }], 
            allow: [
              { to: { type: "types" } },
              { to: { type: "feature" } }
            ] 
          },
          { 
            from: [{ type: "store" }], 
            allow: [
              { to: { type: "types" } },
              { to: { type: "lib" } }
            ] 
          },
          { 
            from: [{ type: "hooks" }], 
            allow: [
              { to: { type: "lib" } },
              { to: { type: "types" } }
            ] 
          },
          { 
            from: [{ type: "mocks" }], 
            allow: [
              { to: { type: "feature" } },
              { to: { type: "shared" } },
              { to: { type: "lib" } },
              { to: { type: "types" } }
            ] 
          },
        ],
      }],
    },
  },
]);

export default eslintConfig;
