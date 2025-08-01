"use client";
import { GlobalRefetchProvider } from "@/context/TriggerRefetchContext";
import { client } from "@/lib/apollo-client";
import "@ant-design/v5-patch-for-react-19";
import { ApolloProvider } from "@apollo/client";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import enUS from "antd/es/locale/en_US";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<ApolloProvider client={client}>
					<ConfigProvider
						locale={enUS}
						theme={{
							token: { colorPrimary: "#1E3A8A", colorInfo: "#1E3A8A" },
							components: {
								Segmented: {
									itemSelectedBg: "#1E3A8A",
									itemSelectedColor: "#ffffff",
								},
							},
						}}
					>
						<GlobalRefetchProvider>{children}</GlobalRefetchProvider>
					</ConfigProvider>
				</ApolloProvider>
			</body>
		</html>
	);
}
