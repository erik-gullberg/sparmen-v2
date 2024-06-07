import styles from "./page.module.css";
import SpexList from "../../components/SpexList/SpexList";
import TopList from "../../components/TopList/TopList";

export default function Home() {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Top 10</h3>
        </div>
        <div>
          <TopList></TopList>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Spex</h3>
          <button className={styles.addButton}>+</button>
        </div>
        <div>
          <SpexList></SpexList>
        </div>
      </div>
    </div>
  );
}
