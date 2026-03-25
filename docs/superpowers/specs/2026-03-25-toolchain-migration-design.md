# Toolchain Migration: yarn/microbundle/jest → pnpm/vite/vitest

## Overview

Migrate the `use-undo` library's toolchain from legacy/unmaintained tools to modern alternatives:

1. **Package manager:** yarn → pnpm
2. **Build tool:** microbundle → vite (library mode)
3. **Test runner:** jest → vitest

## Context

`use-undo` is a small React hooks library (single source file `index.ts`, ~145 lines) that provides undo/redo functionality. It has two test files and no CI/CD pipeline. The library ships as an npm package with TypeScript declarations.

## 1. Package Manager: yarn → pnpm

### Changes

- Run `pnpm import` to convert `yarn.lock` → `pnpm-lock.yaml` (preserves resolved versions)
- Delete `yarn.lock`
- Update all scripts referencing `yarn` to use `pnpm`:
  - `prepublishOnly`: `yarn build` → `pnpm build`
  - `preversion`: `yarn test:cov` → `pnpm test:cov`
- Update `.husky/pre-commit`: `npm run pretty-quick` → `pnpm run pretty-quick`
- Update `prepare` script: `husky install` → `husky` (required for husky v9)

### No changes needed

- `package.json` structure remains the same
- Dependencies stay identical
- `.npmrc` not required (pnpm defaults are fine)

## 2. Build Tool: microbundle → vite (library mode)

### New file: `vite.config.ts`

Single complete config file combining build and test settings:

```ts
/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true }),
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `use-undo.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

Note: `vite-plugin-dts` with `rollupTypes: true` generates a single bundled `.d.ts` file. With entry `index.ts`, it produces `lib/index.d.ts`.

### package.json changes

**Remove fields:**
- `source` (microbundle-specific)
- `umd:main` (dropping UMD)

**Update fields:**
```json
{
  "main": "lib/use-undo.cjs",
  "module": "lib/use-undo.mjs",
  "types": "lib/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./lib/index.d.ts",
        "default": "./lib/use-undo.mjs"
      },
      "require": {
        "types": "./lib/index.d.ts",
        "default": "./lib/use-undo.cjs"
      }
    }
  }
}
```

**Update scripts:**
- `build`: `rimraf lib && microbundle ...` → `vite build`

**Remove devDependencies:**
- `microbundle`
- `rimraf`
- `@types/node` (not needed — library doesn't use Node APIs, Vite provides its own types)

**Add devDependencies:**
- `vite`
- `vite-plugin-dts`

### Output directory

Output goes to `lib/` (configured via `build.outDir`) to match the existing `files` field and `.gitignore`. Vite handles cleaning the output directory automatically via `emptyOutDir`.

## 3. Test Runner: jest → vitest

### Config changes

- Delete `jest.config.js`
- Test config lives inside `vite.config.ts` (shown above in Section 2)

### Test file changes

With `globals: true`, test files should work without modification since Vitest provides Jest-compatible globals (`describe`, `it`, `expect`).

The tests do not use `jest.fn()` or `jest.spyOn()`, so no `vi.*` replacements are needed. The tests use `import React from 'react'` which remains harmless with the `react-jsx` transform.

The tests call `afterEach(cleanup)` explicitly — this is unnecessary with `@testing-library/react` v13+ (auto-cleanup) but still works and is harmless. We'll leave it as-is.

### package.json script changes

- `test`: `jest` → `vitest run`
- `test:cov`: `jest --coverage --runInBand --forceExit` → `vitest run --coverage`
- `test:watch`: `jest --watch` → `vitest`
- Remove `pre-commit` script (unused — husky calls `pretty-quick` directly)

**Remove devDependencies:**
- `jest`
- `ts-jest`
- `@types/jest`

**Add devDependencies:**
- `vitest`
- `@vitest/coverage-v8` (for coverage support)
- `jsdom` (explicit dependency, was implicit via jest before)

## 4. Dependency Updates

Bump to latest versions:
- `typescript` → latest 5.x
- `@testing-library/react` → latest v16.x
- `@types/react` → latest
- `@types/react-dom` → latest
- `react` / `react-dom` (devDeps) → 18.x (required by `@testing-library/react` v14+)
- `prettier` → latest 3.x
- `pretty-quick` → latest
- `husky` → latest 9.x

**Risk note:** The `@testing-library/react` jump from v11 to v16 is significant. Key changes: auto-cleanup (v13+), stricter `act()` wrapping, React 18 concurrent mode support. The test APIs used (`render`, `fireEvent`, `getByTestId`) remain stable across versions, and our tests are simple hook tests, so risk is low. If tests fail, we'll address during implementation.

**Keep unchanged:**
- Peer dependency range: `react` / `react-dom` >= 16.8.6

## 5. tsconfig.json Updates

Minimal changes needed:
- `jsx`: `react` → `react-jsx` (modern JSX transform, works with Vite)
- Vite handles compilation, so tsconfig is primarily for IDE/type-checking
- No `declaration: true` needed — `vite-plugin-dts` handles declaration generation internally

## Files Changed

| Action | File |
|--------|------|
| Delete | `yarn.lock` |
| Delete | `jest.config.js` |
| Create | `pnpm-lock.yaml` (via `pnpm import`) |
| Create | `vite.config.ts` |
| Modify | `package.json` |
| Modify | `tsconfig.json` |
| Modify | `.husky/pre-commit` |

## Verification

After all changes:
1. `pnpm install` succeeds
2. `pnpm build` produces `lib/use-undo.mjs`, `lib/use-undo.cjs`, `lib/index.d.ts`
3. `pnpm test` passes all existing tests
4. `pnpm test:cov` produces coverage report
5. `pnpm pack --dry-run` shows correct package contents (lib/ files only)
