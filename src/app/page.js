import styles from "./page.module.css";
import sparmen from "../../resources/sparmen.json"
import Link from "next/link";

export default function Home() {
    return (
        <main className={styles.main}>
            <input type="text" className={styles.searchBar} placeholder="Sök..."/>
            <div className={styles.container}>
                <div className={styles.containerHeader}>
                    <h3>Spex</h3>
                </div>
                <div className={styles.containerBody}>
                    <ul>
                        {Object.keys(sparmen).map(key => (
                            <li key={key}>
                                <Link spex={sparmen[key]} href={`/spex/${sparmen[key].meta.number}`}>{sparmen[key].meta.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </main>
    );
}
