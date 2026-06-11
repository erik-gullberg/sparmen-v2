"use client";
import { useEffect, useState } from "react";
import styles from "./TextSizeControl.module.css";

const SIZES = [16, 18, 20, 24, 28];
const DEFAULT = 18;
const STORAGE_KEY = "lyrics-font-size";

// A−/A+ control for lyrics size. Persists to localStorage and drives the
// --lyrics-font-size CSS variable consumed by .songText / .warningSongText.
export default function TextSizeControl() {
  const [size, setSize] = useState(null);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    setSize(SIZES.includes(stored) ? stored : DEFAULT);
  }, []);

  useEffect(() => {
    if (size == null) return;
    document.documentElement.style.setProperty(
      "--lyrics-font-size",
      `${size}px`,
    );
    localStorage.setItem(STORAGE_KEY, String(size));
  }, [size]);

  const step = (dir) =>
    setSize((current) => {
      const next = SIZES.indexOf(current) + dir;
      return SIZES[Math.min(SIZES.length - 1, Math.max(0, next))];
    });

  // Reserve the space before hydration so layout doesn't jump.
  if (size == null) return <div className={styles.control} aria-hidden="true" />;

  return (
    <div className={styles.control}>
      <button
        type="button"
        className={styles.button}
        onClick={() => step(-1)}
        disabled={size === SIZES[0]}
        aria-label="Mindre text"
      >
        A−
      </button>
      <span className={styles.label} aria-hidden="true">
        Textstorlek
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => step(1)}
        disabled={size === SIZES[SIZES.length - 1]}
        aria-label="Större text"
      >
        A+
      </button>
    </div>
  );
}
