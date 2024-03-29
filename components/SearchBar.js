"use client";
import styles from "@/app/page.module.css";
import { useState } from "react";
import Link from "next/link";

function SearchBar() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchBar}
        placeholder="Sök spex..."
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button className={styles.searchButton}>
        <Link
          href={{
            pathname: "/search",
            query: { q: inputValue },
          }}
        >
          Sök
        </Link>
      </button>
    </div>
  );
}

export default SearchBar;
