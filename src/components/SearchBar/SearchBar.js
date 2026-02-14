"use client";
import styles from "./SearchBar.module.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRandomSongId } from "@/app/actions/randomSong";
import { searchSuggestions } from "@/app/actions/searchActions";

function SearchBar() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState({ songs: [], spex: [] });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch suggestions when input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length < 2) {
      setSuggestions({ songs: [], spex: [] });
      return;
    }

    // Don't fetch suggestions for quick search pattern
    if (inputValue.match(/^\d+\.\d+$/)) {
      setSuggestions({ songs: [], spex: [] });
      return;
    }

    setIsLoadingSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchSuggestions(inputValue);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  // Reset highlight when dropdown content changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [inputValue, isFocused]);

  // Global keyboard shortcut to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        e.key === "/" &&
        !isFocused &&
        document.activeElement.tagName !== "INPUT"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFocused]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAllDropdownItems = useCallback(() => {
    const items = [];

    // Suggestion items
    if (inputValue.length >= 2) {
      suggestions.songs.forEach((song) => {
        items.push({ type: "song", data: song });
      });
      suggestions.spex.forEach((spex) => {
        items.push({ type: "spex", data: spex });
      });
    }

    return items;
  }, [inputValue, suggestions]);

  const handleKeyDown = (event) => {
    const items = getAllDropdownItems();

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < items.length) {
          handleItemSelect(items[highlightedIndex]);
        } else {
          search();
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleItemSelect = (item) => {
    switch (item.type) {
      case "song":
        router.push(`/song/${item.data.id}`);
        break;
      case "spex":
        router.push(`/spex/${item.data.id}`);
        break;
    }
    setIsFocused(false);
  };

  const search = () => {
    if (!inputValue.trim()) return;

    if (inputValue.match(/^\d+\.\d+$/)) {
      const [spexNr, songNr] = inputValue.split(".");
      router.push(`/song/${spexNr}.${songNr}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(inputValue)}`);
    }
    setIsFocused(false);
  };

  const handleRandomSong = async () => {
    setIsLoadingRandom(true);
    try {
      const randomSongId = await getRandomSongId();
      if (randomSongId) {
        router.push(`/song/${randomSongId}`);
        setTimeout(() => setIsLoadingRandom(false), 3000);
      } else {
        setIsLoadingRandom(false);
      }
    } catch (error) {
      console.error("Error fetching random song:", error);
      setIsLoadingRandom(false);
    }
  };

  const showDropdown =
    isFocused &&
    inputValue.length >= 2 &&
    (suggestions.songs.length > 0 ||
      suggestions.spex.length > 0 ||
      isLoadingSuggestions);

  let itemIndex = 0;

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchBar}
            placeholder="Sök sång, spex, melodi..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            autoComplete="off"
          />
        </div>
        <button onClick={search} className={styles.button}>
          Sök
        </button>
        <button
          onClick={handleRandomSong}
          className={styles.button}
          disabled={isLoadingRandom}
          title="Slumpa sång"
        >
          {isLoadingRandom ? "..." : "🎲"}
        </button>
      </div>

      {showDropdown && (
        <div className={styles.dropdown} ref={dropdownRef}>
          {/* Loading State */}
          {isLoadingSuggestions && inputValue.length >= 2 && (
            <div className={styles.loadingSpinner}>Söker...</div>
          )}

          {/* Song Suggestions */}
          {!isLoadingSuggestions && suggestions.songs.length > 0 && (
            <div className={styles.dropdownSection}>
              <div className={styles.sectionHeader}>
                <span>Sånger</span>
              </div>
              {suggestions.songs.map((song) => {
                const currentIndex = itemIndex++;
                return (
                  <div
                    key={song.id}
                    className={`${styles.dropdownItem} ${highlightedIndex === currentIndex ? styles.highlighted : ""}`}
                    onClick={() =>
                      handleItemSelect({ type: "song", data: song })
                    }
                  >
                    <span className={styles.icon}>🎵</span>
                    <div className={styles.text}>
                      <div>{song.name}</div>
                      <div className={styles.subtext}>
                        {song.show?.spex?.name} - {song.show?.year_short}
                      </div>
                    </div>
                    <span className={styles.keyboardHint}>↵</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spex Suggestions */}
          {!isLoadingSuggestions && suggestions.spex.length > 0 && (
            <div className={styles.dropdownSection}>
              <div className={styles.sectionHeader}>
                <span>Spex</span>
              </div>
              {suggestions.spex.map((spex) => {
                const currentIndex = itemIndex++;
                return (
                  <div
                    key={spex.id}
                    className={`${styles.dropdownItem} ${highlightedIndex === currentIndex ? styles.highlighted : ""}`}
                    onClick={() =>
                      handleItemSelect({ type: "spex", data: spex })
                    }
                  >
                    <span className={styles.icon}>🎭</span>
                    <span className={styles.text}>{spex.name}</span>
                    <span className={styles.keyboardHint}>↵</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!isLoadingSuggestions &&
            inputValue.length >= 2 &&
            suggestions.songs.length === 0 &&
            suggestions.spex.length === 0 && (
              <div className={styles.noResults}>
                Inga förslag hittades. Tryck Enter för att söka.
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
