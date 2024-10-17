import styles from "./page.module.css";
import SpexList from "../components/SpexList/SpexList";
import TopList from "../components/TopList/TopList";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar/SearchBar";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <SearchBar />
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Top 10</h3>
        </div>
        <div className={styles.containerBody}>
          <Suspense fallback={<div>Laddar top 10...</div>}>
            <TopList></TopList>
          </Suspense>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Spex</h3>
          <Link href={"/new"}>
            <button className={styles.addButton}>Nytt +</button>
          </Link>
        </div>
        <div>
          <Suspense fallback={<div>Laddar spex...</div>}>
            <SpexList></SpexList>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
