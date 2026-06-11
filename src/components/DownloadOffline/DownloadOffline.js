"use client";
import { useEffect, useState } from "react";
import createClient from "@/utils/supabase/browserClient";
import toast from "react-hot-toast";
import { Download, Check } from "lucide-react";
import styles from "./DownloadOffline.module.css";

const STORAGE_KEY = "offline-downloaded-at";
// Keep concurrency low so old phones / weak connections aren't overwhelmed.
const CONCURRENCY = 6;

// Warms the service worker cache with every song/spex page so the whole
// songbook works offline — meant to be tapped on good wifi before heading down
// to a signal-dead basement. Relies on the SW's StaleWhileRevalidate rule:
// fetching each URL stores it in the song-spex-pages cache.
export default function DownloadOffline() {
  const [supported, setSupported] = useState(true);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const ok =
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      "caches" in window;
    setSupported(ok);
    setDownloaded(Boolean(localStorage.getItem(STORAGE_KEY)));
  }, []);

  const download = async () => {
    if (!navigator.onLine) {
      toast.error("Du måste vara online för att ladda ner.");
      return;
    }

    setWorking(true);
    setProgress({ done: 0, total: 0 });

    try {
      // The SW must be active and controlling the page for fetches to be cached.
      await navigator.serviceWorker.ready;

      const supabase = createClient();
      const [songs, spex] = await Promise.all([
        supabase.from("song").select("id"),
        supabase.from("spex").select("id"),
      ]);

      const urls = [
        "/",
        "/top-songs",
        ...(spex.data ?? []).map((s) => `/spex/${s.id}`),
        ...(songs.data ?? []).map((s) => `/song/${s.id}`),
      ];

      setProgress({ done: 0, total: urls.length });

      let index = 0;
      let completed = 0;
      const worker = async () => {
        while (index < urls.length) {
          const url = urls[index++];
          try {
            await fetch(url);
          } catch {
            // A single failed page shouldn't abort the whole download.
          }
          completed += 1;
          setProgress({ done: completed, total: urls.length });
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, worker));

      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setDownloaded(true);
      toast.success("Hela spärmen är nedladdad! 🍍");
    } catch (error) {
      console.error("Offline download failed:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setWorking(false);
    }
  };

  if (!supported) return null;

  const percent = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  return (
    <div className={styles.wrapper}>
      {working ? (
        <div className={styles.progressBox}>
          <div className={styles.progressLabel}>
            Laddar ner… {progress.done}/{progress.total}
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <button className={styles.button} onClick={download}>
            {downloaded ? (
              <>
                <Check size={16} strokeWidth={2} /> Uppdatera offline-spärmen
              </>
            ) : (
              <>
                <Download size={16} strokeWidth={2} /> Ladda ner hela spärmen
              </>
            )}
          </button>
          <p className={styles.hint}>
            {downloaded
              ? "Nedladdad – funkar offline i källaren 🍍"
              : "Spara hela spärmen så funkar den utan nät"}
          </p>
        </>
      )}
    </div>
  );
}
