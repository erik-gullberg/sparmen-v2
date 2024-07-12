"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "@/app/page.module.css";

export function TwoNumberInput() {
  const [firstNum, setFirstNum] = useState("");
  const [secondNum, setSecondNum] = useState("");

  // Create a reference to the second input
  const secondInputRef = useRef(null);

  const handleFirstNumChange = (e) => {
    const value = e.target.value;
    setFirstNum(value);

    // If the first input has two digits, focus the second input
    if (value.length === 2) {
      secondInputRef.current.focus();
    }
  };

  return (
    <div>
      <input
        className={styles.smallSearchBar}
        type="number"
        value={firstNum}
        onChange={handleFirstNumChange}
        placeholder="Spexnr"
      />
      <span> . </span>
      <input
        className={styles.smallSearchBar}
        type="number"
        value={secondNum}
        onChange={(e) => setSecondNum(e.target.value)}
        placeholder="Låtnr"
        ref={secondInputRef} // Attach the ref to the second input
      />

      <button className={styles.button} id={styles.smallButton}>
        <Link
          href={{
            pathname: `/song/${firstNum}.${secondNum}`,
          }}
        >
          Direktsök
        </Link>
      </button>
    </div>
  );
}
