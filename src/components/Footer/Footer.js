import Link from "next/link";
import { getCommits, formatDate } from "@/utils/github";
import styles from "./Footer.module.css";

// Server component. Shows when the app was last updated as a subtle "actively
// maintained" signal and links to the full changelog. Renders nothing but the
// changelog link if GitHub is unreachable, so it never breaks the page.
export default async function Footer() {
  const commits = await getCommits(10);
  const latest = commits[0];

  return (
    <footer className={styles.footer}>
      <Link href="/changelog" className={styles.latest}>
        <span className={styles.label}>
          {latest ? `Senast uppdaterad ${formatDate(latest.date)}` : "Ändringslogg"}
        </span>
        <span className={styles.cta}>Alla ändringar →</span>
      </Link>
    </footer>
  );
}

