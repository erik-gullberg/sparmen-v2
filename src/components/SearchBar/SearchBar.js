"use client";
import styles from "@/app/page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRandomSongId } from "@/app/actions/randomSong";

function SearchBar() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

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

  const handleRandomSong = async () => {
    setIsLoadingRandom(true);
    try {
      const randomSongId = await getRandomSongId();
      if (randomSongId) {
        router.push(`/song/${randomSongId}`);
      }
    } catch (error) {
      console.error("Error fetching random song:", error);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
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
      <button
        onClick={handleRandomSong}
        className={styles.button}
        disabled={isLoadingRandom}
        title="Slumpa sång"
      >
        {isLoadingRandom ? "..." : "🎲"}
      </button>
    </div>
  );
}

export default SearchBar;
