import styles from "./page.module.css";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar/SearchBar";

const SpexList = dynamic(() => import("../components/SpexList/SpexList"), {
  loading: () => <small>Laddar spex...</small>,
  ssr: true,
});

const TopList = dynamic(() => import("../components/TopList/TopList"), {
  loading: () => <small>Laddar top 10...</small>,
  ssr: true,
});

//Cache for 6 hours
export const revalidate = 21600;

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
