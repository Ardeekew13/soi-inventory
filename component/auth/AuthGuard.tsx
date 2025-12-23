"use client";

import { ME_QUERY } from "@/graphql/auth/me";
import { useQuery, useApolloClient } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { hasPermission } from "@/utils/permissions";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data, loading } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only', // Always fetch fresh data to prevent stale cache issues
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
        // Redirect to appropriate page based on user's permissions
        const userPermissions = data.me.permissions || {};
        const userRole = data.me.role;
        
        // SUPER_ADMIN and users with dashboard view permission go to dashboard
        if (userRole === "SUPER_ADMIN" || hasPermission(userPermissions, "dashboard", "view")) {
          router.replace("/dashboard");
        }
        // Otherwise, redirect to point-of-sale if they have access
        else if (hasPermission(userPermissions, "pointOfSale", "view")) {
          router.replace("/point-of-sale");
        }
        // Otherwise, redirect to first page they have access to
        else if (hasPermission(userPermissions, "transaction", "view")) {
          router.replace("/transaction");
        }
        else if (hasPermission(userPermissions, "inventory", "view")) {
          router.replace("/inventory");
        }
        else if (hasPermission(userPermissions, "product", "view")) {
          router.replace("/product");
        }
        else if (hasPermission(userPermissions, "cashDrawer", "view")) {
          router.replace("/cash-drawer");
        }
        else if (hasPermission(userPermissions, "settings", "view")) {
          router.replace("/settings");
        }
        else {
          // No permissions found, redirect to dashboard (will show no permission page)
          router.replace("/dashboard");
        }
      }
      setChecked(true);
    }
  }, [loading, data, router, apolloClient, pathName]);

  if (loading) return null;
  if (!data?.me) return null;

  return <>{children}</>;
}
