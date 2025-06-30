"use client";
import createClient from "@/utils/supabase/browserClient";
import styles from "@/app/page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginButton() {
  const { user, loading } = useAuth();
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://sparmen-v2.vercel.app",
      },
    });
  };

  if (loading) {
    return (
      <button className={styles.button} role="button" disabled>
        Loggar in...
      </button>
    );
  }

  return (
    <div>
      {!user ? (
        <button className={styles.button} role="button" onClick={handleLogin}>
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
