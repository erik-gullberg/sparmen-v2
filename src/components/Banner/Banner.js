"use client";

import { useEffect, useState } from "react";
import styles from "./banner.module.css";

export default function Banner() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("sparmen-banner-dismissed-3-4");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("sparmen-banner-dismissed-3-4", "true");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bannerHeader}>
        <div>
          <h3 className={styles.header}>Spärmnytt</h3>
        </div>
        <button
          onClick={handleDismiss}
          className={styles.dismissButton}
          aria-label="Stäng banner"
          title="Stäng"
        >
          ✕
        </button>
      </div>
      <p className={styles.paragraph}>Nyheter 3/4/2026</p>
      <ul>
        <li>Lägg till låtar i spellistor</li>
        <li>Knappar är lite större</li>
      </ul>
    </div>
  );
}
