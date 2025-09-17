"use client";

import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
	children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter();
	const [checked, setChecked] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function checkUser() {
			setLoading(true);
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				// not logged in → send to login page
				router.replace("/");
			} else {
				// logged in
				setChecked(true);
			}
			setLoading(false);
		}

		checkUser();

		// optional: listen for logout/login events
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!session) {
				router.replace("/");
			}
		});

		return () => subscription.unsubscribe();
	}, [router]);

	if (loading || !checked) return null;

	return <>{children}</>;
}
