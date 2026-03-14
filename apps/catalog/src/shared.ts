// Shared inline SVG for deterministic image demos (no external URLs)
export const landscapeSvg = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect fill="#87CEEB" width="800" height="400"/><circle cx="650" cy="80" r="50" fill="%23FFD700"/><polygon points="100,400 250,150 400,400" fill="%23228B22"/><polygon points="300,400 500,100 700,400" fill="%23006400"/><rect y="350" width="800" height="50" fill="%23654321"/><rect x="350" y="280" width="60" height="70" fill="%238B4513"/><polygon points="350,280 380,240 410,280" fill="%23A0522D"/></svg>`)}`;

// Raster PNG generated from canvas — object-fit works correctly on raster images
export function createLandscapePng(): string {
  const c = document.createElement("canvas");
  c.width = 400; c.height = 200;
  const ctx = c.getContext("2d")!;
  // Sky
  ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, 400, 200);
  // Sun
  ctx.fillStyle = "#FFD700"; ctx.beginPath(); ctx.arc(320, 40, 25, 0, Math.PI * 2); ctx.fill();
  // Mountains
  ctx.fillStyle = "#228B22"; ctx.beginPath(); ctx.moveTo(50, 200); ctx.lineTo(125, 75); ctx.lineTo(200, 200); ctx.fill();
  ctx.fillStyle = "#006400"; ctx.beginPath(); ctx.moveTo(150, 200); ctx.lineTo(250, 50); ctx.lineTo(350, 200); ctx.fill();
  // Ground
  ctx.fillStyle = "#654321"; ctx.fillRect(0, 175, 400, 25);
  // House
  ctx.fillStyle = "#8B4513"; ctx.fillRect(175, 140, 30, 35);
  ctx.fillStyle = "#A0522D"; ctx.beginPath(); ctx.moveTo(175, 140); ctx.lineTo(190, 120); ctx.lineTo(205, 140); ctx.fill();
  return c.toDataURL("image/png");
}

export const gradientPlaceholder = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#186ade 0%,#7ac7e3 100%)"></div>`;
