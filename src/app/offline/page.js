import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Offline – Spärmen",
};

export default function Offline() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>📡</div>
      <h2>Du är offline</h2>
      <p>Ingen internetanslutning – typiskt i en källare.</p>
      <p className={styles.hint}>
        Sidor du redan besökt funkar fortfarande. Har du laddat ner spärmen når
        du alla låtar.
      </p>
      <Link href="/" className={styles.link}>
        ← Till startsidan
      </Link>
    </div>
  );
}
