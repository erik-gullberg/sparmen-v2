import styles from "./banner.module.css";

export default function Banner() {
  return (
    <div className={styles.banner}>
      <h3 className={styles.header}>Nytt i Spärmen! 🍍 2025-10-19</h3>
      <small>29/05/2025</small>
      <h4>App!</h4>
      <p className={styles.paragraph}>
        Spärmen finns nu som PWA app. Installera för att nå spärmen snabbt och lätt från din mobil eller dator!
      </p>

      <hr></hr>
      <h4>Snabbare!</h4>
      <p className={styles.paragraph}>
        Spärmen är nu ännu snabbare tack vare förbättrad caching och optimeringar i bakgrunden.
      </p>
    </div>
  );
}
