"use client";
import AuthGuard from "@/component/auth/AuthGuard";
import OfflineIndicator from "@/component/common/OfflineIndicator";
import dynamic from "next/dynamic";

const NavbarLayout = dynamic(() => import("@/component/Navbar"), {
	ssr: false,
});

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard>
			<OfflineIndicator />
			<NavbarLayout>{children}</NavbarLayout>
		</AuthGuard>
	);
}
