/**
 * Shared Vite alias config for dev mode.
 * Points @maneki/* imports to source files for instant HMR.
 * Only used in serve mode — production builds use dist/ via package exports.
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { AliasOptions } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

export const devAliases: AliasOptions = [
  {
    find: /^@maneki\/foundation\/assets\/(.*)/,
    replacement: resolve(root, "packages/foundation/assets/$1"),
  },
  {
    find: /^@maneki\/foundation$/,
    replacement: resolve(root, "packages/foundation/src/index.ts"),
  },
  {
    find: /^@maneki\/foundation\/heroui-theme\.js$/,
    replacement: resolve(root, "packages/foundation/src/heroui-theme.ts"),
  },
  {
    find: /^@maneki\/ui-components\/components\/(.*)\.js$/,
    replacement: resolve(root, "packages/ui-components/src/components/$1.ts"),
  },
  {
    find: /^@maneki\/ui-components$/,
    replacement: resolve(root, "packages/ui-components/src/index.ts"),
  },
  {
    find: /^@maneki\/grid-layout$/,
    replacement: resolve(root, "packages/grid-layout/src/index.ts"),
  },
  {
    find: /^@maneki\/flex-layout$/,
    replacement: resolve(root, "packages/flex-layout/src/index.ts"),
  },
  {
    find: /^@maneki\/charts$/,
    replacement: resolve(root, "packages/charts/src/index.ts"),
  },
];
