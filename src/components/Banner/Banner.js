'use client';

import { useEffect, useState } from 'react';
import styles from "./banner.module.css";

export default function Banner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Listen for the beforeinstallprompt event (works on Android/Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS instructions
      setShowInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // If no prompt available, show generic instructions
      setShowInstructions(true);
      return;
    }

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

      {!isInstalled && (
        <>
          <button onClick={handleInstall} className={styles.installButton}>
            🍍 Installera Spärmen
          </button>

          {showInstructions && isIOS && (
            <div className={styles.instructions}>
              <p><strong>För att installera på iPhone/iPad:</strong></p>
              <ol>
                <li>Tryck på Dela-knappen <span className={styles.icon}>⎙</span> längst ner</li>
                <li>Scrolla ner och tryck på &quot;Lägg till på hemskärmen&quot;</li>
                <li>Tryck på &quot;Lägg till&quot;</li>
              </ol>
            </div>
          )}

          {showInstructions && !isIOS && !deferredPrompt && (
            <div className={styles.instructions}>
              <p><strong>För att installera:</strong></p>
              <p>Använd din webbläsares meny och välj &quot;Installera app&quot; eller &quot;Lägg till på hemskärmen&quot;</p>
            </div>
          )}
        </>
      )}

      {isInstalled && (
        <p className={styles.installedText}>✅ Appen är redan installerad!</p>
      )}
    </div>
  );
}
