"use client";
import { Mutation } from "@/generated/graphql";
import { LOGOUT_MUTATION } from "@/graphql/login/login";
import logo from "@/public/soi-logo.png";
import { CloseOutlined, LogoutOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { MenuOpenOutlined } from "@mui/icons-material";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ProductionQuantityLimitsOutlinedIcon from "@mui/icons-material/ProductionQuantityLimitsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Flex, Layout, Menu, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

const { Header, Content, Sider } = Layout;

const items = [
	{
		label: "Dashboard",
		key: "/dashboard",
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
	const [collapsed, setCollapsed] = useState(false);
	const [hydrated, setHydrated] = useState(false);
	const [logout, { loading }] = useMutation<Mutation>(LOGOUT_MUTATION);

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	const onMenuClick = ({ key }: { key: string }) => {
		router.push(key);
		setSelectedKeys([key]);
		localStorage.setItem("selectedKeys", JSON.stringify([key]));
		setCollapsed(true);
	};

	useEffect(() => {
		const stored = localStorage.getItem("selectedKeys");
		if (stored) {
			setSelectedKeys(JSON.parse(stored));
		} else {
			setSelectedKeys([window.location.pathname]);
		}
		return () => {
			localStorage.removeItem("selectedKeys");
		};
	}, []);

	useEffect(() => {
		setHydrated(true);
	}, []);
	return (
		<Layout style={{ backgroundColor: "#FFFFF", minHeight: "100vh" }}>
			{isMobile ? (
				<Sider
					theme="light"
					collapsible
					collapsed={collapsed}
					onCollapse={(value) => setCollapsed(value)}
					collapsedWidth={0}
					width={250}
					breakpoint="md"
					style={{
						overflow: "auto",
						height: "100vh",
						position: "fixed",
						left: 0,
						top: 0,
						bottom: 0,
						zIndex: 1000,
						boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
						background: "#fff",
					}}
				>
					{/* Logo and Close */}
					<div
						style={{
							padding: 16,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<Image src={logo} alt="logo" height={40} />
							<Typography.Title level={4} style={{ margin: 0 }}>
								Soi Suites
							</Typography.Title>
						</div>
						<CloseOutlined
							onClick={() => setCollapsed(true)}
							style={{ fontSize: 20, cursor: "pointer", color: "#999" }}
						/>
					</div>

					{/* Menu */}
					<Menu
						mode="inline"
						style={{ fontSize: 16, borderRight: 0 }}
						items={items}
						onClick={onMenuClick}
					/>

					{/* Logout Button */}
					<div
						style={{
							position: "absolute",
							bottom: 16,
							left: 0,
							right: 0,
							textAlign: "center",
						}}
					>
						<Flex
							align="center"
							justify="center"
							style={{
								padding: "8px 16px",
								cursor: "pointer",
								gap: 8,
							}}
							onClick={handleLogout}
						>
							<LogoutOutlined style={{ fontSize: 20 }} />
							<Typography.Text strong>Logout</Typography.Text>
						</Flex>
					</div>
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
						<Image src={logo} alt="logo" height={30} />
						Soi Suites
					</div>
					<Menu
						selectedKeys={selectedKeys}
						mode="horizontal"
						theme="light"
						style={{ flex: 1 }}
						items={items}
						onClick={onMenuClick}
					/>

					<Typography.Text onClick={handleLogout} style={{ cursor: "pointer" }}>
						Logout
					</Typography.Text>
				</Header>
			)}
			<Content
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
				}}
			>
				{isMobile && (
					<Header
						style={{
							backgroundColor: "#ffffff",
							padding: "0 24px",
							height: 64,
							display: "flex",
							alignItems: "center",
							boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
							zIndex: 1,
						}}
					>
						<MenuOpenOutlined onClick={() => setCollapsed(!collapsed)} />
					</Header>
				)}
				{children}
			</Content>
		</Layout>
	);
}
