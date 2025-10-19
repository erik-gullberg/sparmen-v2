import styles from "./page.module.css";
import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar/SearchBar";
import TopList from "@/components/TopList/TopList";
import SpexList from "@/components/SpexList/SpexList";

// Cache for 1 hour
export const revalidate = 3600;
// Force static generation
export const dynamic = "force-static";

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
        <Suspense fallback={<div>Laddar...</div>}>
          <TopList />
        </Suspense>
        <Link href={"/top-songs"} className={styles.link}>
          Se fler
        </Link>
      </div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Spex</h3>
        </div>
        <div>
          <Suspense fallback={<div>Laddar...</div>}>
            <SpexList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
