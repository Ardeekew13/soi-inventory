"use client";

import { ME_QUERY } from "@/graphql/auth/me";
import { useQuery } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data, loading } = useQuery(ME_QUERY);
  const router = useRouter();
  const pathName = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        console.log(router);

        router.replace("/");
      } else if (data?.me && pathName === "/") {
        router.replace("/dashboard");
      }
      setChecked(true);
    }
  }, [loading, data, router]);

  if (loading) return null;
  if (!data?.me) return null;


console.log(pathName)
  return <>{children}</>;
}
