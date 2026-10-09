import { expect, it, vi } from "vitest";

it("can load the package twice without redefining custom elements", async () => {
  const first = await import("./index.js");
  const button = customElements.get("ui-button");
  expect(button).toBe(first.UiButton);

  vi.resetModules();
  await expect(import("./index.js")).resolves.toBeDefined();
  expect(customElements.get("ui-button")).toBe(button);
});
