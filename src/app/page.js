import styles from "./page.module.css";
import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar/SearchBar";
import TopList from "@/components/TopList/TopList";
import SpexList from "@/components/SpexList/SpexList";

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
        <TopList />
        <Link href={"/top-songs"} className={styles.link}>
          Se fler
        </Link>
      </div>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>Spex</h3>
        </div>
        <div>
          <SpexList />
        </div>
      </div>
    </div>
  );
}
