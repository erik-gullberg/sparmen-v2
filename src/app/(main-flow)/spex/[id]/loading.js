import styles from "@/app/page.module.css";

export default function Loading() {
  return (
    <div className={styles.flex}>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Laddar...</h3>
        </div>
      </div>
    </div>
  );
}
