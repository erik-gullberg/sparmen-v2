'use client';

import { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return;
    }

    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
    if (hasSeenPrompt) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after a short delay
      setTimeout(() => setShowInstallPrompt(true), 3000);
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
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <div className={styles.installPrompt}>
      <div className={styles.content}>
        <div className={styles.icon}>📱</div>
        <div className={styles.text}>
          <h3>Installera Spärmen</h3>
          <p>Snabbare och smidigare</p>
        </div>
        <div className={styles.buttons}>
          <button onClick={handleInstall} className={styles.installButton}>
            Installera
          </button>
          <button onClick={handleDismiss} className={styles.dismissButton}>
            Inte nu
          </button>
        </div>
      </div>
    </div>
  );
}

