"use client"
import styles from "@/app/page.module.css";
import getSpexByNumber from "../../../../resources/getSpexByNumber";
import {useState} from "react";

export default function Page({params}) {
    const spex = getSpexByNumber(params.id);

    const [selectedTab, setSelectedTab] = useState(Object.keys(spex)[Object.keys(spex).length - 2]);
    console.log(selectedTab);
    return (
        <div className={styles.flex}>
            <div className={styles.header}>
                <h1>{spex.meta.name}</h1>
            </div>

            <div>
                {Object.keys(spex).filter(key => key !== 'meta').map(key => (
                    <button key={key} onClick={() => setSelectedTab(key)}>{key}</button>
                ))}
            </div>
            <div>
                {selectedTab && Object.keys(spex[selectedTab]).map((item, index) => (
                    <details key={index}>
                        <summary>{spex[selectedTab][item].name}</summary>
                        <div dangerouslySetInnerHTML={{__html: spex[selectedTab][item].text}}/>
                    </details>
                ))}
            </div>
        </div>
    );
}