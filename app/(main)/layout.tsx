"use client";
import AuthGuard from "@/component/auth/AuthGuard";
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
			<NavbarLayout>{children}</NavbarLayout>
		</AuthGuard>
	);
}
