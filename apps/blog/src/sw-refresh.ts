/**
 * Auto-refresh on service worker update.
 * Reloads the page when the user returns to the tab after an SW update,
 * so they always see the latest version without interrupting active use.
 */

let updatePending = false;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // New SW activated — schedule refresh
    if (document.visibilityState === "hidden") {
      // Tab is already hidden — reload immediately (user won't notice)
      location.reload();
    } else {
      // Tab is visible — wait until user leaves and comes back
      updatePending = true;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (updatePending && document.visibilityState === "visible") {
      updatePending = false;
      location.reload();
    }
  });
}
