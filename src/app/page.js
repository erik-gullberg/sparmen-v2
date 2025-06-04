import styles from "./page.module.css";
import SpexList from "../components/SpexList/SpexList";
import TopList from "../components/TopList/TopList";
import { Suspense } from "react";
import SearchBar from "@/components/SearchBar/SearchBar";
import Link from "next/link";
import Banner from "@/components/Banner/Banner";

//Cache for 30 minutes
export const revalidate = 1800;

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/*<Banner />*/}
      <SearchBar />
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Top 10</h3>
        </div>
        <Suspense fallback={<small>Laddar top 10...</small>}>
          <TopList />
          <Link href={"/top-songs"} className={styles.link}>
            Se fler
          </Link>
        </Suspense>
      </div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Spex</h3>
        </div>
        <div>
          <Suspense fallback={<small>Laddar spex...</small>}>
            <SpexList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
