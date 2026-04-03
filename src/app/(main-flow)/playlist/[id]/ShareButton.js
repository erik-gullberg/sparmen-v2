"use client";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function ShareButton({ shareUrl }) {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("Länk kopierad till urklipp!"))
      .catch(() => toast.error("Kunde inte kopiera länk."));
  };

  return (
    <button className={styles.shareButton} onClick={handleCopy}>
      Kopiera spellistans länk
    </button>
  );
}

