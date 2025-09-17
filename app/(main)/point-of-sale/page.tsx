"use client";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import CheckoutDialog from "@/component/point-of-sale/dialog/checkoutReceiptDialog";
import PaymentSteps from "@/component/point-of-sale/dialog/paymentSteps";
import ReceiptDialog from "@/component/point-of-sale/dialog/receiptDialog";
import ItemPosCard from "@/component/point-of-sale/itemCard";
import PosListTable from "@/component/point-of-sale/posListTable";
import PosOrderListTable from "@/component/point-of-sale/posOrderListTable";
import { useModal } from "@/hooks/useModal";
import { supabase } from "@/lib/supabase-client";
import { Product, Sale } from "@/lib/supabase.types";
import { Cart, makeCart } from "@/utils/carts";
import { formatPeso } from "@/utils/helper";
import { ShoppingCartOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Drawer,
	Flex,
	FloatButton,
	InputNumber,
	message,
	Modal,
	Row,
	Skeleton,
	Tabs,
	Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

const PointOfSale = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { isModalOpen, closeModal, selectedRecord } = useModal();
	const {
		openModal: ReceiptModal,
		isModalOpen: receiptOpen,
		closeModal: closeReceipt,
		selectedRecord: receipt,
	} = useModal();
	const {
		openModal: tableSelectorModal,
		isModalOpen: tableSelectorOpen,
		closeModal: closeTableSelector,
	} = useModal();

	const {
		openModal: checkoutModalOpen,
		isModalOpen: isCheckoutModalOpen,
		closeModal: closeCheckoutModal,
	} = useModal();

	const [cart, setCart] = useState<Cart>(makeCart());
	const [cartOpen, setCartOpen] = useState(false);
	const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
	const [search, setSearch] = useState("");
	const [cashGiven, setCashGiven] = useState(0);
	const userId = localStorage.getItem("userId");
	const router = useRouter();
	const [modal, modalHolder] = Modal.useModal();
	const [isParked, setIsParked] = useState(false);
	const [cashDrawerId, setCashDrawerId] = useState("");
	const [selectedTableNo, setSelectedTableNo] = useState<number | null>(null);
	const [defaultTab, setDefaultTab] = useState("carts");
	const [record, setRecord] = useState<any | undefined>(undefined);
	const [triggerRefetch, setTriggerRefetch] = useState(false);
	const [serviceType, setServiceType] = useState<string | null>(null);
	const [paymentMethod, setPaymentMethod] = useState("CASH");
	const [currentStep, setCurrentStep] = useState(0);
	const [saleId, setSaleId] = useState("");

	const [loading, setLoading] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [salesLoading, setSalesLoading] = useState(true);
	const [sales, setSales] = useState<Sale[]>([]);
	const [isCashOpen, setIsCashOpen] = useState(false);
	const [isCashOpenLoading, setIsCashOpenLoading] = useState(true);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase.rpc("get_products", {
				search: search || null,
			});
			if (error) throw error;
			setProducts(data ?? []);
		} catch (error) {
			console.error("Error fetching products:", error);
			messageApi.error("Failed to load products");
			setProducts([]);
		}

		setLoading(false);
	};

	const fetchSales = async () => {
		setSalesLoading(true);

		const { data, error } = await supabase.rpc("get_sales", {
			p_tab: "active",
			p_search: null,
		});

		if (error) {
			messageApi.error("Failed to load sales: " + error.message);
		} else {
			setSales(data ?? []);
		}

		setSalesLoading(false);
	};

	const checkDrawer = async () => {
		setIsCashOpenLoading(true);
		const { data, error } = await supabase
			.from("cash_drawers")
			.select("*")
			.eq("opened_by_id", userId)
			.eq("status", "OPEN")
			.single();
		if (error || !data) {
			setIsCashOpen(false);
		} else {
			setIsCashOpen(true);
			setCashDrawerId(data.id);
		}
		setIsCashOpenLoading(false);
	};

	useEffect(() => {
		fetchProducts();
	}, [search]);

	useEffect(() => {
		fetchSales();
	}, [triggerRefetch]);

	useEffect(() => {
		checkDrawer();
	}, [userId]);

	const shownOnceRef = useRef(false);

	const newItemTotal = cart?.saleItems.reduce((acc, item) => {
		if (item.fromDb === false) {
			return acc + item.price * item.quantity;
		}
		return acc;
	}, 0);

	const change =
		newItemTotal !== undefined ? newItemTotal - (cashGiven ?? 0) : 0;

	const handleSubmit = (isParked: boolean, type: string, id?: string) => {
		console.log("isParked", isParked);
		console.log("type", type);
		setIsParked(isParked);
		if (type === "CHECKOUT") {
			if (change > 0) {
				return messageApi.error("Cash given is less than total amount.");
			}
			checkoutModalOpen();
		} else if (type === "PARKED") {
			if (cart?.saleItems.length === 0) {
				return messageApi.error("Cart is empty.");
			}
			if (!cart?.saleItems.some((item) => item.fromDb === false)) {
				return messageApi.error("There's no new order");
			}

			tableSelectorModal(() => {
				if (selectedTableNo !== null) {
					setCashGiven(0);
				}
			});
		}
		setCashGiven(0);
	};
	console.log("cart", cart);
	const handleSuccess = () => {
		setCart(makeCart());
		closeReceipt();
		setSelectedTableNo(null);
		closeTableSelector();
	};

	const handleClose = () => {
		setCurrentStep(0);
		setServiceType(null);
		setSelectedTableNo(null);
		setPaymentMethod("CASH");
		closeTableSelector();
	};

	const getCash = (value: number | null) => {
		setCashGiven(value ?? 0);
	};

	const handleTab = (key: string) => {
		setDefaultTab(key);
	};

	const tableProps = useMemo(
		() => ({
			data: products ?? [],
			loading,
			refetch: fetchProducts,
			messageApi,
			cart: cart ?? makeCart(),
			setCart,
			search,
			setSearch,
			setDefaultTab,
		}),
		[
			products,
			loading,
			messageApi,
			cart,
			setCart,
			search,
			setSearch,
			setDefaultTab,
		]
	);

	const posTableProps = useMemo(
		() => ({
			cart: cart ?? makeCart(),
			setCart,
			messageApi,
		}),
		[cart, setCart, messageApi]
	);

	const posOrderListTableProps = useMemo(
		() => ({
			sales: sales ?? [],
			setCart: (cartItems: SetStateAction<Cart>) => setCart(cartItems),
			setDefaultTab,
			setRecord,
			setSelectedTableNo,
			setPaymentMethod,
			setServiceType,
			setSaleId,
		}),
		[
			sales,
			setCart,
			setDefaultTab,
			setRecord,
			setSelectedTableNo,
			setPaymentMethod,
			setServiceType,
			setSaleId,
		]
	);

	const tabItems = [
		{
			key: "carts",
			label: "Cart",
			children: <PosListTable {...posTableProps} type="takeout" />,
		},
		{
			key: "orders",
			label: "Orders",
			children: <PosOrderListTable {...posOrderListTableProps} />,
		},
	];

	useEffect(() => {
		if (isCashOpenLoading) return;
		if (shownOnceRef.current) return;

		if (!isCashOpen) {
			shownOnceRef.current = true;
			Modal.confirm({
				title: "Cash Drawer is Closed",
				content: "Please open the cash drawer to proceed.",
				onOk: () => {
					Modal.destroyAll();
					router.push("/cash-drawer");
				},
				afterClose: () => {
					shownOnceRef.current = false;
				},
			});
		}
	}, [isCashOpenLoading, isCashOpen, router]);

	// useEffect(() => {
	// 	if (triggerRefetch) {
	// 		orderRefetch();
	// 		setTriggerRefetch(false);
	// 	}
	// });

	if (loading || isCashOpenLoading || salesLoading) {
		return <Skeleton active />;
	}

	const orderTotalNumber = cart?.saleItems?.map(
		(item) => item.price * item.quantity
	);
	const orderTotal = orderTotalNumber?.reduce((acc, item) => acc + item, 0);

	return (
		<div
			style={{
				padding: 20,
				boxSizing: "border-box",
				overflow: "auto",
			}}
		>
			{modalHolder}
			<Row gutter={8} style={{ height: "100%" }}>
				<Col lg={15} sm={24} style={{ height: "85vh" }}>
					<Card style={{ height: "100%" }}>
						<div style={{ height: "100%" }}>
							<ItemPosCard {...tableProps} />
						</div>
					</Card>
				</Col>

				{isMobile ? (
					<Drawer
						title="Cart"
						placement="right"
						onClose={() => setCartOpen(false)}
						open={cartOpen}
						width="100%"
					>
						<Tabs
							defaultActiveKey={defaultTab}
							onChange={handleTab}
							items={tabItems}
						/>
						<Flex justify="space-between" style={{ marginTop: 16 }}>
							<Typography.Title level={5}>Total:</Typography.Title>
							<Typography.Title level={5}>
								₱{orderTotal.toFixed(2)}
							</Typography.Title>
						</Flex>
						<Flex justify="space-between">
							<Typography.Title level={5}>Cash Given:</Typography.Title>
							<InputNumber
								name="cashGiven"
								onChange={(value: number | null) => getCash(value)}
							/>
						</Flex>
						<Flex justify="space-between" align="center">
							<Typography.Title level={5}>Change</Typography.Title>
							<Typography.Title level={5}>
								₱{Math.abs(change).toFixed(2)}
							</Typography.Title>
						</Flex>
						<Button
							type="primary"
							block
							onClick={() => handleSubmit(false, "CHECKOUT", undefined)}
						>
							Checkout
						</Button>
						<Button
							color="yellow"
							block
							onClick={() => handleSubmit(true, "PARKED", record?.id)}
						>
							Park Order
						</Button>
					</Drawer>
				) : (
					<Col lg={9} sm={24} style={{ height: "85vh" }}>
						<Card
							style={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Flex justify="space-between" align="flex-start">
								<Typography.Title level={5}>Carts</Typography.Title>
								<Typography.Text>
									{cart?.saleItems.length > 0 && (
										<>
											<Typography.Text strong italic>
												Order No: {cart.orderNo} Table No: {cart.tableNo}
											</Typography.Text>
										</>
									)}
								</Typography.Text>
							</Flex>

							<div style={{ flex: 1, marginBottom: 24 }}>
								<Tabs
									activeKey={defaultTab}
									onChange={handleTab}
									items={tabItems}
									tabBarExtraContent={
										<Button
											type="link"
											onClick={() => {
												setCart(makeCart());
												setSelectedTableNo(null);
												setCurrentStep(0);
												setServiceType(null);
											}}
										>
											Close
										</Button>
									}
								/>
							</div>
							{defaultTab !== "orders" && (
								<div
									style={{
										position: "absolute",
										bottom: 16,
										left: 16,
										right: 16,
									}}
								>
									<Flex justify="space-between" style={{ marginBottom: 12 }}>
										<Typography.Title level={4} style={{ margin: 0 }}>
											Order Total
										</Typography.Title>
										<Typography.Title level={4} style={{ margin: 0 }}>
											{formatPeso(orderTotal)}
										</Typography.Title>
									</Flex>
									{/* <Flex justify="space-between">
										<Typography.Title level={5}>Cash Given:</Typography.Title>
										<InputNumber
											name="cashGiven"
											onChange={(value: number | null) => getCash(value)}
										/>
									</Flex> */}
									<Flex justify="space-between" align="center">
										<Typography.Title level={5}>
											New Items Total
										</Typography.Title>
										<Typography.Title level={5}>
											{formatPeso(newItemTotal)}
										</Typography.Title>
									</Flex>
									<Button
										type="primary"
										block
										onClick={() => handleSubmit(false, "CHECKOUT", undefined)}
									>
										Checkout
									</Button>
									<Button
										color="red"
										variant="solid"
										block
										style={{ marginTop: 6 }}
										onClick={() => handleSubmit(true, "PARKED", record?.id)}
									>
										Park Order
									</Button>
								</div>
							)}
						</Card>
					</Col>
				)}
			</Row>

			{isMobile && (
				<FloatButton
					type="primary"
					style={{ marginTop: 16 }}
					onClick={() => setCartOpen(true)}
					icon={<ShoppingCartOutlined />}
				>
					View Cart
				</FloatButton>
			)}

			{contextHolder}
			<AddItemModal
				key={selectedRecord?.id}
				open={isModalOpen}
				onClose={closeModal}
				refetch={fetchProducts}
				messageApi={messageApi}
				record={selectedRecord}
			/>
			<ReceiptDialog
				key={selectedRecord?.id}
				open={receiptOpen}
				onClose={closeReceipt}
				cart={cart}
				refetch={fetchSales}
				totalAmount={orderTotal}
				messageApi={messageApi}
				isParked={isParked}
				cashDrawerId={cashDrawerId}
				selectedTableNo={selectedTableNo}
				onSuccess={handleSuccess}
				id={record?.id}
				serviceType={serviceType}
			/>
			<PaymentSteps
				open={tableSelectorOpen}
				onClose={handleClose}
				setSelectedTableNo={setSelectedTableNo}
				selectedTableNo={selectedTableNo}
				refetch={fetchSales}
				serviceType={serviceType}
				setServiceType={setServiceType}
				cart={cart}
				id={record?.id}
				isParked={isParked}
				cashDrawerId={cashDrawerId}
				onSuccess={handleSuccess}
				currentStep={currentStep}
				setCurrentStep={setCurrentStep}
			/>
			<CheckoutDialog
				saleId={saleId}
				open={isCheckoutModalOpen}
				onClose={closeCheckoutModal}
				cart={cart}
				messageApi={messageApi}
				totalAmount={orderTotal}
				refetch={fetchSales}
				isParked={isParked}
				cashDrawerId={cashDrawerId}
				selectedTableNo={selectedTableNo}
				onSuccess={handleSuccess}
				id={record?.id}
			/>
		</div>
	);
};

export default PointOfSale;
