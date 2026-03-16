import { registerSW } from "virtual:pwa-register";

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function initPWA(): void {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Show update banner
      const banner = document.getElementById("update-banner");
      if (banner) banner.classList.add("visible");
    },
    onOfflineReady() {
      // Silently ready — no UI needed for a catalog app
    },
    onRegisteredSW(_swUrl, registration) {
      // Poll for updates every hour
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  // Wire up the refresh button
  const btn = document.getElementById("update-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      updateSW?.(true);
    });
  }
}
