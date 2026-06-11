"use client";
import { useEffect } from "react";

// Keeps the screen awake while lyrics are on display so the phone doesn't lock
// mid-song. Renders nothing. Degrades silently on phones without the API or
// when the request is refused (e.g. low battery).
export default function WakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    let sentinel = null;
    let active = true;

    const request = async () => {
      if (!active || document.visibilityState !== "visible") return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Refused or unsupported — nothing to do.
      }
    };

    // The browser releases the lock when the tab is hidden; re-acquire on return.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") request();
    };

    request();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinel?.release?.().catch(() => {});
    };
  }, []);

  return null;
}
