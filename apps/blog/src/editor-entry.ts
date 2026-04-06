import { injectAllTokens, registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";

injectAllTokens();
import("@maneki/foundation/heroui-theme.js").then(({ injectHerouiTheme }) => injectHerouiTheme());
registerIconFont(materialSymbolsWoff2);

// Theme toggle (reuse same localStorage key as blog)
const saved = localStorage.getItem("blog-theme");
if (saved === "dark") {
  document.documentElement.setAttribute("data-theme", "heroui-dark");
} else {
  document.documentElement.setAttribute("data-theme", "heroui");
}

import("./pages/editor/index.js").then(({ editorRoute }) => {
  const root = document.getElementById("editor-root");
  if (!root) return;
  root.innerHTML = editorRoute.render();
  setTimeout(() => {
    if (editorRoute.setup) editorRoute.setup();
  }, 0);
});
