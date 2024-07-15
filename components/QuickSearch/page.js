"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "@/app/page.module.css";
import { useRouter } from "next/navigation";

export function TwoNumberInput() {
  const router = useRouter();

  const [spexNr, setSpexNr] = useState("");
  const [songNr, setSongNr] = useState("");

  const spexNrInput = useRef(null);
  const songNrInput = useRef(null);

  const handleSpexNrChange = (e) => {
    const value = e.target.value;
    setSpexNr(value);

    if (value.length === 2) {
      songNrInput.current.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && spexNr && songNr) {
      router.push(`/song/${spexNr}.${songNr}`);
    }

    if (event.key === "Backspace" && songNr === "") {
      spexNrInput.current.focus();
    }
  };

  return (
    <div>
      <input
        className={styles.smallSearchBar}
        type="number"
        value={spexNr}
        onChange={handleSpexNrChange}
        placeholder="Spexnr"
        ref={spexNrInput}
      />
      <span> . </span>
      <input
        className={styles.smallSearchBar}
        type="number"
        value={songNr}
        onChange={(e) => setSongNr(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Låtnr"
        ref={songNrInput}
      />

      <button className={styles.button} id={styles.smallButton}>
        <Link
          href={{
            pathname: `/song/${spexNr}.${songNr}`,
          }}
        >
          Direktsök
        </Link>
      </button>
    </div>
  );
}
