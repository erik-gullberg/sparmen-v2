"use client";

import { useEffect, useState } from "react";
import styles from "./banner.module.css";

export default function Banner() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("sparmen-banner-dismissed-13-2");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("sparmen-banner-dismissed-13-2", "true");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.bannerHeader}>
        <div>
          <h3 className={styles.header}>Välkommen till en ny spextermin! 🍍</h3>
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
      <p className={styles.paragraph}>Nyheter 13/2/2026</p>
      <ul>
        <li>Spärmen bor nu på spärmen.se</li>
        <li>Man kan logga in igen</li>
        <li>Autocomplete i söken</li>
      </ul>
      <br />
      <p>Kontakta Erik Gullberg för all support med Spärmen</p>
    </div>
  );
}
