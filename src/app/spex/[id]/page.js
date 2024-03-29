"use client";
import styles from "@/app/page.module.css";
import pageStyle from "./page.module.css";
import getSpexByNumber from "../../../utils/getSpexByNumber";
import { useState } from "react";

export default function Page({ params }) {
  const spex = getSpexByNumber(params.id);

  const [selectedTab, setSelectedTab] = useState(
    Object.keys(spex)[Object.keys(spex).length - 2],
  );
  return (
    <div className={styles.flex}>
      <div className={styles.container}>
        <div className={styles.containerHeader}>
          <h3>{spex.meta.name}</h3>
        </div>
        <div className={pageStyle.tabContainer}>
          {Object.keys(spex)
            .filter((key) => key !== "meta")
            .map((key) => (
              <button
                className={`${pageStyle.tab} ${key === selectedTab ? pageStyle.selected : ""}`}
                key={key}
                onClick={() => setSelectedTab(key)}
              >
                {key}
              </button>
            ))}
        </div>
        <div className={pageStyle.songContainer}>
          {selectedTab &&
            Object.keys(spex[selectedTab]).map((item, index) => (
              <details className={pageStyle.dropDown} key={index}>
                <summary>{spex[selectedTab][item].name}</summary>
                <div
                  className={pageStyle.songText}
                  dangerouslySetInnerHTML={{
                    __html: spex[selectedTab][item].text,
                  }}
                />
              </details>
            ))}
        </div>
      </div>
    </div>
  );
}
