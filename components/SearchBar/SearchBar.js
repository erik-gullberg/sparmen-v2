"use client";
import styles from "@/app/page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SearchBar() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      router.push(`/search?q=${inputValue}`);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchBar}
        placeholder="Sök sång, spex, melodi..."
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
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
