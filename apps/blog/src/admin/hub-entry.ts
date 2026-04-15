import { registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";

registerIconFont(materialSymbolsWoff2);

import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import "./hub.js";
import "./deploy-fab.js";

const root = document.getElementById("admin-root")!;
root.appendChild(document.createElement("admin-hub"));
