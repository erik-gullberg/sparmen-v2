
import { createClient } from "@/utils/supabase/server";
import styles from "@/app/page.module.css";
import Link from "next/link";

const [sorting, setSorting] = ["year", null];
function sort(spexWithYear) {
  console.log("start", spexWithYear);
  spexWithYear.sort((b, a) => {
    const [yearA, termA] = a.year.split('_');
    const [yearB, termB] = b.year.split('_');
  
    // Jämför år
    const yearComparison = parseInt(yearA) - parseInt(yearB);
    if (yearComparison !== 0) {
      return yearComparison;
    }
  
    // Om åren är lika, jämför terminer
    if (termA && termB) {
      return termB.localeCompare(termA);
    }
  
    return 0;
  });
  console.log("end", spexWithYear);
  return spexWithYear;
}
async function fetchData() {
  const supabase = createClient();
  let spex = await supabase.from("spex").select("id, name").order("id");

  // Använd Promise.all för att vänta på alla asynkrona operationer
  const spexWithYear = await Promise.all(
    spex.data.map(async (element) => {
      let year = await supabase
        .from("show")
        .select("year")
        .eq("spex_id", element.id)
        .order("year", { ascending: false })
        .limit(1)
        .single();
      
      // Lägg till year i elementet
      element.year = year.data?.year || null;
      return element;
    })
  );
  if(sorting === "year") {
    spex = sort(spexWithYear)
  }
  else{
    spex = spex.data
  }

  
  return spex;
}
export default async function Page() {
  const data = await fetchData();
  let [sorting, setSorting] = ["year", null];

  return (
    <ul className={styles.spexList}>
      {data.map((spex, i) => (
        <li key={i} className={styles["song-container"]}>
          <Link href={`/spex/${spex.id}`} passHref>
            <div className={styles.song}> 
              {spex.id}. {spex.name}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}