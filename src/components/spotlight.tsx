"use client";

import { useEffect, useRef } from "react";

const spotlightMedia =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function Spotlight() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const media = window.matchMedia(spotlightMedia);
    let detachPointerListeners = () => {};

    const syncMedia = () => {
      detachPointerListeners();
      detachPointerListeners = () => {};
      if (!media.matches) return;

      let animationFrame: number | null = null;
      let pointerX = 0;
      let pointerY = 0;

      const hide = () => {
        layer.dataset.active = "false";
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      };

      const paint = () => {
        layer.style.setProperty("--spotlight-x", `${pointerX}px`);
        layer.style.setProperty("--spotlight-y", `${pointerY}px`);
        layer.dataset.active = "true";
        animationFrame = null;
      };

      const follow = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (animationFrame === null) {
          animationFrame = window.requestAnimationFrame(paint);
        }
      };

      const onVisibilityChange = () => {
        if (document.visibilityState !== "visible") hide();
      };

      document.documentElement.addEventListener("pointerenter", follow);
      document.documentElement.addEventListener("pointerleave", hide);
      window.addEventListener("pointermove", follow, { passive: true });
      window.addEventListener("pointercancel", hide);
      window.addEventListener("blur", hide);
      document.addEventListener("visibilitychange", onVisibilityChange);

      detachPointerListeners = () => {
        hide();
        document.documentElement.removeEventListener("pointerenter", follow);
        document.documentElement.removeEventListener("pointerleave", hide);
        window.removeEventListener("pointermove", follow);
        window.removeEventListener("pointercancel", hide);
        window.removeEventListener("blur", hide);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    };

    syncMedia();
    media.addEventListener("change", syncMedia);

    return () => {
      detachPointerListeners();
      media.removeEventListener("change", syncMedia);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="spotlight"
      data-active="false"
      aria-hidden="true"
    />
  );
}