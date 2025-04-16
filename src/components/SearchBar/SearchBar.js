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
      search();
    }
  };

  const search = () => {
    if (inputValue.match(/^\d+\.\d+$/)) {
      const [spexNr, songNr] = inputValue.split(".");
      quickSearch(spexNr, songNr);
    } else {
      router.push(`/search?q=${inputValue}`);
    }
  };

  const quickSearch = (spexNr, songNr) => {
    router.push(`/song/${spexNr}.${songNr}`);
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
      <Link
        href={{
          pathname: "/search",
          query: { q: inputValue },
        }}
        className={styles.button}
      >
        Sök
      </Link>
    </div>
  );
}

export default SearchBar;
