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

### No changes needed

- `package.json` structure remains the same
- Dependencies stay identical
- `.npmrc` not required (pnpm defaults are fine)

## 2. Build Tool: microbundle → vite (library mode)

### New file: `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: 'index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `use-undo.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
```

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

**Add devDependencies:**
- `vite`
- `vite-plugin-dts`

### Output directory

Vite's `build.outDir` defaults to `dist`, but we configure it to output to `lib/` to match the existing `files` field and `.gitignore`. Vite handles cleaning the output directory automatically via `emptyOutDir`.

**Update `vite.config.ts`** to include `outDir: 'lib'` in the build config.

## 3. Test Runner: jest → vitest

### Config changes

- Delete `jest.config.js`
- Add vitest config inside `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  // ... build config ...
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### Test file changes

With `globals: true`, test files should work without modification since Vitest provides Jest-compatible globals (`describe`, `it`, `expect`, `jest` → `vi`).

**Potential issue:** If tests use `jest.fn()` or `jest.spyOn()`, these need to change to `vi.fn()` / `vi.spyOn()`. Need to check test files during implementation.

### package.json script changes

- `test`: `jest` → `vitest run`
- `test:cov`: `jest --coverage --runInBand --forceExit` → `vitest run --coverage`
- `test:watch`: `jest --watch` → `vitest`

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
- `@testing-library/react` → latest (v16.x for React 18 support)
- `@types/react` → latest
- `@types/react-dom` → latest
- `react` / `react-dom` (devDeps) → 18.x
- `prettier` → latest 3.x
- `pretty-quick` → latest
- `husky` → latest 9.x

**Keep unchanged:**
- Peer dependency range: `react` / `react-dom` >= 16.8.6

## 5. tsconfig.json Updates

Minimal changes needed:
- `jsx`: `react` → `react-jsx` (modern JSX transform, works with Vite)
- Vite handles compilation, so tsconfig is primarily for IDE/type-checking

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
| Modify | `__test__/index.spec.tsx` (if jest globals used) |
| Modify | `__test__/checkpoint.spec.tsx` (if jest globals used) |

## Verification

After all changes:
1. `pnpm install` succeeds
2. `pnpm build` produces `lib/use-undo.mjs`, `lib/use-undo.cjs`, `lib/index.d.ts`
3. `pnpm test` passes all existing tests
4. `pnpm test:cov` produces coverage report
