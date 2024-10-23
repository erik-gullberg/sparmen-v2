import { createClient } from "@/utils/supabase/server";
import styles from "@/app/page.module.css";
import Link from "next/link";
async function fetchData() {
  const supabase = await createClient();

  return supabase.from("spex").select("id, name").order("id");
}

export default async function Page() {
  const data = await fetchData();

  return (
    <ul className={styles.spexList}>
      {data.data.map((spex, i) => (
        <li key={i}>
          <Link href={`/spex/${spex.id}`}>
            <div className={styles.song}>
              {spex.id}. {spex.name}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
