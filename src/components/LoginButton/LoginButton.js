"use client";
import createClient from "@/utils/supabase/browserClient";
import styles from "@/app/page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";


export default function LoginButton() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const data = await supabase.auth.getUser();
      setUser(data.data.user);
    };
    checkUser();
  }, [supabase.auth]);

  return (
    <div>
      {!user ? (
        <button
          className={styles.button}
          role="button"
          onClick={() => {
            const supabase = createClient();
            supabase.auth
              .signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: "https://sparmen-v2.vercel.app",
                },
              })
              .then(async (r) => {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
              })
              .catch((e) => console.error(e));
          }}
        >
          Logga in
        </button>
      ) : (
        <Link href="/profile">
          <Image
            src={user.user_metadata.avatar_url}
            alt={"User avatar"}
            width={35}
            height={35}
            sizes="(max-width: 768px) 25vw, 35px"
          ></Image>
        </Link>
      )}
    </div>
  );
}
