"use client";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ProductionQuantityLimitsOutlinedIcon from "@mui/icons-material/ProductionQuantityLimitsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Layout, Menu, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

const { Header, Content, Sider } = Layout;

const items = [
	{
		label: "Dashboard",
		key: "/",
		icon: <GridViewOutlinedIcon />,
	},
	{
		label: "Inventory",
		key: "/inventory",
		icon: <Inventory2OutlinedIcon />,
	},
	{
		label: "Product",
		key: "/product",
		icon: <ProductionQuantityLimitsOutlinedIcon />,
	},
	{
		label: "Point Of Sale",
		key: "/point-of-sale",
		icon: <ShoppingBagOutlinedIcon />,
	},
	{
		label: "Transaction",
		key: "/transaction",
		icon: <ReceiptLongOutlinedIcon />,
	},
];

export default function NavbarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [selectedKeys, setSelectedKeys] = useState<string[]>(["/"]);
	const router = useRouter();
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
	const [collapsed, setCollapsed] = useState(isMobile);
	const [hydrated, setHydrated] = useState(false);

	const onMenuClick = ({ key }: { key: string }) => {
		router.push(key);
		setSelectedKeys([key]);
		localStorage.setItem("selectedKeys", JSON.stringify([key]));
	};

	useEffect(() => {
		const stored = localStorage.getItem("selectedKeys");
		if (stored) {
			setSelectedKeys(JSON.parse(stored));
		} else {
			setSelectedKeys([window.location.pathname]);
		}
	}, []);

	useEffect(() => {
		setHydrated(true);
	}, []);
	return (
		<Layout style={{ backgroundColor: "#FFFFF", minHeight: "100vh" }}>
			{isMobile ? (
				<Sider
					theme="light"
					collapsed={collapsed}
					collapsible
					onCollapse={(collapsed) => setCollapsed(collapsed)}
					collapsedWidth={0}
				>
					<div
						style={{
							fontWeight: "bold",
							marginRight: 40,
							flex: 1,
							textAlign: "center",
							marginTop: 20,
						}}
					>
						<Typography.Title level={3}>My App</Typography.Title>
					</div>
					<Menu mode="inline" items={items} onClick={onMenuClick} />
				</Sider>
			) : (
				<Header
					style={{
						display: "flex",
						alignItems: "center",
						backgroundColor: "#ffffff",
						padding: "0 24px",
					}}
				>
					<div
						style={{
							fontWeight: "bold",
							marginRight: 40,
						}}
					>
						My App
					</div>
					<Menu
						selectedKeys={selectedKeys}
						mode="horizontal"
						theme="light"
						style={{ flex: 1 }}
						items={items}
						onClick={onMenuClick}
					/>
				</Header>
			)}
			<Content style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{children}
			</Content>
		</Layout>
	);
}
