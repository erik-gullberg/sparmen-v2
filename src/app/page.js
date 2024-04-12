import styles from "./page.module.css";
import SpexList from "../../components/SpexList/SpexList";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.containerHeader}>
        <h3>Spex</h3>
      </div>
      <div>
        <SpexList></SpexList>
      </div>
    </div>
  );
}
