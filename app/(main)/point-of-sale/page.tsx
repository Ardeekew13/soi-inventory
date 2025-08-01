"use client";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import ReceiptDialog from "@/component/point-of-sale/dialog/receiptDialog";
import ItemPosCard from "@/component/point-of-sale/itemCard";
import PosListTable from "@/component/point-of-sale/posListTable";

import { Query } from "@/generated/graphql";
import { GET_PRODUCTS } from "@/graphql/inventory/products";
import { useModal } from "@/hooks/useModal";
import { CartProduct } from "@/utils/helper";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
	Button,
	Card,
	Col,
	Drawer,
	Flex,
	FloatButton,
	message,
	Row,
	Skeleton,
	Typography,
} from "antd";
import { useMemo, useState } from "react";
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
	const [cart, setCart] = useState<CartProduct[]>([]);
	const [cartOpen, setCartOpen] = useState(false);
	const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
	const [search, setSearch] = useState("");

	const { data, loading, refetch } = useQuery<Query>(GET_PRODUCTS, {
		variables: {
			search,
		},
	});

	const tableProps = useMemo(
		() => ({
			data: data?.products ?? [],
			loading,
			refetch,
			messageApi,
			cart,
			setCart,
			search,
			setSearch,
		}),
		[data, loading, refetch, messageApi, cart, setCart, search, setSearch]
	);

	const posTableProps = {
		cart,
		setCart,
		messageApi,
	};

	const totalAmount = cart.reduce((acc, item) => {
		return acc + item.price * item.quantity;
	}, 0);

	const handleSubmit = () => {
		ReceiptModal();
	};

	if (loading) {
		return <Skeleton active />;
	}

	return (
		<div
			style={{
				padding: 20,
				boxSizing: "border-box",
				overflow: "auto",
			}}
		>
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
						<PosListTable {...posTableProps} />
						<Flex justify="space-between" style={{ marginTop: 16 }}>
							<Typography.Title level={5}>Total:</Typography.Title>
							<Typography.Title level={5}>
								₱{totalAmount.toFixed(2)}
							</Typography.Title>
						</Flex>
						<Button type="primary" block onClick={handleSubmit}>
							Checkout
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
							<Typography.Title level={5}>Carts</Typography.Title>
							<div style={{ flex: 1, marginBottom: 24 }}>
								<PosListTable {...posTableProps} />
							</div>
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
										Total
									</Typography.Title>
									<Typography.Title level={4} style={{ margin: 0 }}>
										₱{totalAmount.toFixed(2)}
									</Typography.Title>
								</Flex>
								<Button type="primary" block onClick={handleSubmit}>
									Checkout
								</Button>
							</div>
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
				refetch={refetch}
				messageApi={messageApi}
				record={selectedRecord}
			/>
			<ReceiptDialog
				key={selectedRecord?.id}
				open={receiptOpen}
				onClose={closeReceipt}
				cart={cart}
				totalAmount={totalAmount}
				messageApi={messageApi}
				setCart={setCart}
			/>
		</div>
	);
};

export default PointOfSale;
