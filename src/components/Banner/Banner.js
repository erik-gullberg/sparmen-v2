'use client';

import { useEffect, useState } from 'react';
import styles from "./banner.module.css";

export default function Banner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className={styles.banner}>
      <h3 className={styles.header}>Nytt i Spärmen! 🍍 2025-10-19</h3>
      <small>29/05/2025</small>
      <h4>App!</h4>
      <p className={styles.paragraph}>
        Spärmen finns nu som PWA app. Installera för att nå spärmen snabbt och lätt från din mobil eller dator!
      </p>

      {!isInstalled && deferredPrompt && (
        <button onClick={handleInstall} className={styles.installButton}>
          Installera Spärmen
        </button>
      )}

      {isInstalled && (
        <p className={styles.installedText}>✅ Appen är redan installerad!</p>
      )}

      <hr></hr>
      <h4>Snabbare!</h4>
      <p className={styles.paragraph}>
        Spärmen är nu ännu snabbare tack vare förbättrad caching och optimeringar i bakgrunden.
      </p>
    </div>
  );
}
