"use client";

import { ME_QUERY } from "@/graphql/auth/me";
import { useQuery, useApolloClient } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data, loading } = useQuery(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const apolloClient = useApolloClient();
  const router = useRouter();
  const pathName = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        // Clear cache when user is not authenticated
        apolloClient.clearStore();
        router.replace("/");
      } else if (data?.me && pathName === "/") {
        router.replace("/dashboard");
      }
      setChecked(true);
    }
  }, [loading, data, router, apolloClient]);

  if (loading) return null;
  if (!data?.me) return null;

  return <>{children}</>;
}
