"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const query = searchParams.get("q");
    async function fetchData() {
      const res = await fetch(`http://localhost:3001/search?q=${query}`);

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const json = await res.json();
      setData(json);
    }

    fetchData();
  }, [searchParams]);

  if (!data) {
    return <p>Loading...</p>;
  }

  return <p>{data.text}</p>;
}
