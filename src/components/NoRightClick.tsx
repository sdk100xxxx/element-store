"use client";

import { useEffect } from "react";

/**
 * Deters casual users from context menu and DevTools shortcuts.
 * Bypassable (e.g. open DevTools before load, or via browser menu).
 */
export function NoRightClick() {
  useEffect(() => {
    const preventContext = (e: MouseEvent) => {
      if (e.button === 2) e.preventDefault();
    };
    const preventKeys = (e: KeyboardEvent) => {
      const f12 = e.key === "F12";
      const ctrlShiftI = e.ctrlKey && e.shiftKey && e.key === "I";
      const ctrlShiftJ = e.ctrlKey && e.shiftKey && e.key === "J";
      const ctrlU = e.ctrlKey && e.key === "u";
      const ctrlS = e.ctrlKey && e.key === "s"; // save/source in some browsers
      if (f12 || ctrlShiftI || ctrlShiftJ || ctrlU || ctrlS) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys);
    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);
  return null;
}
