"use client";

import { ME_QUERY } from "@/graphql/auth/me";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
	children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const { data, loading } = useQuery(ME_QUERY);
	const router = useRouter();
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		if (!loading) {
			if (!data?.me) {
				router.replace("/");
			}
			setChecked(true);
		}
	}, [loading, data, router]);

	if (loading) return null;
	if (!data?.me) return null;

	return <>{children}</>;
}
