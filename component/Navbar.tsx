"use client";
import { Mutation } from "@/generated/graphql";
import { LOGOUT_MUTATION } from "@/graphql/login/login";
import { ME_QUERY } from "@/graphql/auth/me";
import logo from "@/public/soi-logo.png";
import { CloseOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { MenuOpenOutlined } from "@mui/icons-material";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ProductionQuantityLimitsOutlinedIcon from "@mui/icons-material/ProductionQuantityLimitsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { Avatar, Button, Dropdown, Flex, Layout, Menu, Typography, Space } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { hasPermission } from "@/utils/permissions";

const { Header, Content, Sider } = Layout;

const allItems = [
	{
		label: "Dashboard",
		key: "/dashboard",
		icon: <GridViewOutlinedIcon />,
		permission: { module: "dashboard", action: "view" },
	},
	{
		label: "Inventory",
		key: "/inventory",
		icon: <Inventory2OutlinedIcon />,
		permission: { module: "inventory", action: "view" },
	},
	{
		label: "Product",
		key: "/product",
		icon: <ProductionQuantityLimitsOutlinedIcon />,
		permission: { module: "product", action: "view" },
	},
	{
		label: "Point Of Sale",
		key: "/point-of-sale",
		icon: <ShoppingBagOutlinedIcon />,
		permission: { module: "pointOfSale", action: "view" },
	},
	{
		label: "Transaction",
		key: "/transaction",
		icon: <ReceiptLongOutlinedIcon />,
		permission: { module: "transaction", action: "view" },
	},
	{
		label: "Cash Drawer",
		key: "/cash-drawer",
		icon: <AccountBalanceWalletOutlinedIcon />,
		permission: { module: "cashDrawer", action: "view" },
	},
	{
		label: "Settings",
		key: "/settings",
		icon: <SettingsOutlinedIcon />,
		permission: { module: "settings", action: "view" },
	},
];

export default function NavbarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
		fetchPolicy: 'cache-and-network',
	});
	const user = meData?.me;
	const userPermissions = user?.permissions || {};
	const userRole = user?.role;
	const apolloClient = useApolloClient();

	const items = useMemo(() => {
		// SUPER_ADMIN has full access to all menu items
		if (userRole === 'SUPER_ADMIN') {
			return allItems;
		}
		
		// If still loading user data, don't show any menu items yet
		if (meLoading || !meData) {
			return [];
		}
		
		// Show menu if user has the required permission for the module
		return allItems.filter(item => {
			const perm = item.permission;
			if (!perm) return true; // fallback: show if no permission required
			return hasPermission(userPermissions, perm.module, perm.action as any);
		});
	}, [userPermissions, userRole, meLoading, meData]);

	const [selectedKeys, setSelectedKeys] = useState<string[]>(["/"]);
	const router = useRouter();
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
	const [collapsed, setCollapsed] = useState(false);
	const [hydrated, setHydrated] = useState(false);
	const [logout, { loading }] = useMutation<Mutation>(LOGOUT_MUTATION);

	const handleLogout = async () => {
		await logout();
		// Clear Apollo cache on logout to prevent stale user data
		await apolloClient.clearStore();
		router.push("/");
	};

	// User dropdown menu items
	const userMenuItems: MenuProps['items'] = [
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Logout',
			onClick: handleLogout,
		},
	];

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

					{/* User Info & Logout */}
					<div
						style={{
							position: "absolute",
							bottom: 16,
							left: 0,
							right: 0,
							padding: "0 16px",
						}}
					>
						<Flex
							align="center"
							gap={12}
							style={{
								padding: "12px 16px",
								borderTop: "1px solid #f0f0f0",
							}}
						>
							<Avatar icon={<UserOutlined />} />
							<div style={{ flex: 1 }}>
								<Typography.Text strong style={{ display: "block" }}>
									{user?.firstName} {user?.lastName}
								</Typography.Text>
								<Typography.Text type="secondary" style={{ fontSize: 12 }}>
									{user?.role?.replace('_', ' ')}
								</Typography.Text>
							</div>
							<LogoutOutlined 
								style={{ fontSize: 18, cursor: "pointer", color: "#ff4d4f" }}
								onClick={handleLogout}
							/>
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

					{/* User Info & Logout */}
					<Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
						<Space style={{ cursor: "pointer", marginLeft: 16 }}>
							<Avatar icon={<UserOutlined />} />
							<Typography.Text strong>
								{user?.firstName} {user?.lastName}
							</Typography.Text>
						</Space>
					</Dropdown>
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
