// /src/app/api/auth/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setScratchAuthSession } from "@scratch-auth-component/nextjs";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const privateCode = searchParams.get("privateCode");

  useEffect(() => {
    async function auth() {
      console.log(privateCode);
      const check = await setScratchAuthSession(privateCode);
      console.log("check", check);
      if (check) {
        console.log("Authentication successful");
      } else {
        console.error("Authentication failed");
      }
      router.push("/");
    }
    auth();
  }, [privateCode]);

  return (
    <div className="flex justify-center items-center w-full h-full min-h-[calc(100dvh-64px)]">
      Authenticating Scratch account...
    </div>
  );
}
