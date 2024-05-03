"use client";
import createClient from "@/utils/supabase/browserClient";
import { useEffect, useState } from "react";
import Image from "next/image";

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
        <Image
          src={user.user_metadata.avatar_url}
          alt={"User avatar"}
          width={35}
          height={35}
        ></Image>
      )}
    </div>
  );
}
