import styles from "@/app/page.module.css";
import pageStyle from "@/app/spex/[id]/page.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>Laddar...</h3>
      </div>
      <div className={pageStyle.songText}>
        <div className={pageStyle.placeHolderText}></div>
      </div>
    </div>
  );
}
