# ADR-022: ESLint + Prettier — Monorepo Linting

**Status:** Accepted
**Date:** 2026-04

## Context

The monorepo had stylelint for CSS-in-JS and html-validate for HTML, but no TypeScript linting or formatting. Code style was inconsistent, unused variables accumulated, and there was no automated formatting.

## Decision

Add ESLint 9 (flat config) + typescript-eslint + Prettier to the monorepo.

### ESLint Config

```js
// eslint.config.js
eslint.configs.recommended + tseslint.configs.recommended + prettier;
```

Key rules:

- `@typescript-eslint/no-unused-vars`: warn (with `_` prefix ignore)
- `@typescript-eslint/no-explicit-any`: off (too noisy for imperative DOM code)
- `@typescript-eslint/no-unused-expressions`: off (common Web Component pattern)
- `no-console`: warn (allow log/warn/error)

### Prettier Config

```json
{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 120, "tabWidth": 2 }
```

### Integration

- lint-staged: `*.{ts,tsx,js}` → `eslint --fix` + `prettier --write`
- lint-staged: `*.{json,md,yml,yaml,css}` → `prettier --write`
- npm scripts: `lint`, `lint:fix`, `format`, `format:check`
- Existing stylelint + html-validate preserved

### Ignores

`dist/`, `node_modules/`, `.wrangler/`, `storybook-static/`, `packages/foundation/assets/`, `packages/diagrams/`

## Consequences

- 0 ESLint errors across the monorepo
- ~67 `no-unused-vars` warnings in ui-components (to be cleaned up incrementally)
- Pre-commit hook catches lint issues before they reach CI
- Prettier ensures consistent formatting without manual effort
