export interface SignatureSnapshot {
  readonly clone: HTMLElement;
  readonly frame: Keyframe;
  readonly strokeWidth: number;
}

export function captureSignature(element: HTMLElement): SignatureSnapshot {
  const rect = element.getBoundingClientRect();
  const styles = getComputedStyle(element);
  const clone = element.cloneNode(true);
  if (!(clone instanceof HTMLElement)) throw new TypeError("Signature must be an HTML element");
  return {
    clone,
    strokeWidth: parseFloat(styles.webkitTextStrokeWidth),
    frame: {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      fontSize: styles.fontSize,
      lineHeight: `${rect.height}px`,
      fontWeight: styles.fontWeight,
      fontFamily: styles.fontFamily,
      color: styles.color,
    },
  };
}

export function animateSignature(source: SignatureSnapshot, target: HTMLElement): () => void {
  const destination = captureSignature(target);
  const clone = source.clone;
  clone.className = "sig-clone";
  clone.removeAttribute("style");
  Object.assign(clone.style, {
    position: "fixed",
    display: "block",
    margin: "0",
    padding: "0",
    width: "max-content",
    textDecoration: "none",
    pointerEvents: "none",
    zIndex: "9999",
    willChange: "font-size, top, left",
    ...source.frame,
    webkitTextStrokeWidth: `${source.strokeWidth}px`,
  });
  const underline = clone.querySelector<SVGElement>(".sig-underline");
  if (underline) {
    Object.assign(underline.style, {
      position: "absolute",
      bottom: "-2px",
      left: "-4%",
      width: "115%",
      height: "12px",
      overflow: "visible",
    });
    const path = underline.querySelector("path");
    if (path) {
      path.style.clipPath = "inset(0 0 0 0)";
      path.style.animation = "none";
    }
    underline.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" });
  }
  const visibility = target.style.visibility;
  target.style.visibility = "hidden";
  document.body.appendChild(clone);
  const animation = clone.animate([source.frame, destination.frame], {
    duration: 400,
    easing: "cubic-bezier(0.33, 0, 0.2, 1)",
    fill: "forwards",
  });
  let strokeFrame = 0;
  const updateStroke = () => {
    const progress = animation.effect?.getComputedTiming().progress;
    if (typeof progress === "number") {
      clone.style.webkitTextStrokeWidth = `${source.strokeWidth + (destination.strokeWidth - source.strokeWidth) * progress}px`;
    }
    strokeFrame = requestAnimationFrame(updateStroke);
  };
  strokeFrame = requestAnimationFrame(updateStroke);
  let finished = false;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(strokeFrame);
    target.style.visibility = visibility;
    clone.remove();
    const path = target.querySelector<SVGElement>(".sig-underline path");
    if (path) {
      path.style.animation = "none";
      target.offsetHeight;
      path.style.animation = "sig-write 800ms ease-out forwards";
    }
  };
  void animation.finished.then(cleanup, cleanup);
  return () => {
    cleanup();
    animation.cancel();
  };
}
