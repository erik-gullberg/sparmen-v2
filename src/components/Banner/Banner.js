import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <div className={styles.banner}>
      <h3 className={styles.header}>Nytt!</h3>
      <small>29/03/2025</small>
      <p className={styles.paragraph}>
        Nu kan man skriva saker till spärmen såhär
      </p>
    </div>
  );
}
