import Link from "next/link";
import { getCommits, formatDate, repoUrl } from "@/utils/github";
import styles from "./changelog.module.css";

export const revalidate = 3600;

export const metadata = {
  title: "Changelog | Spärmen",
  description: "Senaste uppdateringarna och förbättringarna i Spärmen.",
};

export default async function ChangelogPage() {
  const commits = await getCommits(40);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Changelog</h1>
      </header>

      {commits.length === 0 ? (
        <p className={styles.empty}>
          Kunde inte hämta ändringar just nu. Försök igen senare eller titta på{" "}
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      ) : (
        <ol className={styles.list}>
          {commits.map((commit) => (
            <li key={commit.sha} className={styles.entry}>
              <div className={styles.marker} aria-hidden="true" />
              <div className={styles.content}>
                <time
                  className={styles.date}
                  dateTime={commit.date ?? undefined}
                >
                  {formatDate(commit.date)}
                </time>
                <p className={styles.message}>{commit.message}</p>
                {commit.body && <p className={styles.body}>{commit.body}</p>}
                <a
                  className={styles.sha}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {commit.shortSha}
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link href="/" className={styles.backLink}>
        ← Tillbaka till startsidan
      </Link>
    </div>
  );
}
