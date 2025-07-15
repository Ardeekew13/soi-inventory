import { Product } from "@/generated/graphql";
import { CartProduct } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import {
	Badge,
	Button,
	Card,
	Col,
	Pagination,
	Row,
	Skeleton,
	Tag,
	Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

interface IProps {
	data: Product[];
	loading: boolean;
	refetch: () => void;
	messageApi: MessageInstance;
	setCart: React.Dispatch<React.SetStateAction<CartProduct[]>>;
	cart: CartProduct[];
}

const PAGE_SIZE = 16;

const ItemPosCard = (props: IProps) => {
	const { data, loading, refetch, messageApi, setCart, cart } = props;
	const [currentPage, setCurrentPage] = useState(1);

	const handleAddToCart = (record: Product) => {
		if (record.availableUnits <= 0) {
			return messageApi.error("Item is out of stock");
		}
		const existingItem = cart.find((item) => item.id === record.id);
		if (existingItem) {
			setCart((prevCart) =>
				prevCart.map((item) =>
					item.id === record.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			);
		} else {
			setCart((prevCart) => [...prevCart, { ...record, quantity: 1 }]);
		}
	};

	const getStockBadgeColor = (units: number) => {
		if (units <= 5) return "red";
		if (units <= 10) return "orange";
		return "green";
	};

	if (loading) {
		return <Skeleton active />;
	}

	const startIdx = (currentPage - 1) * PAGE_SIZE;
	const paginatedData = data.slice(startIdx, startIdx + PAGE_SIZE);

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<div style={{ flex: 1 }}>
				<Row gutter={[16, 16]}>
					{paginatedData.map((item) => (
						<Col lg={6} md={8} sm={24} xs={24} key={item.id}>
							<Card style={{ borderColor: "#1e3a8a" }}>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: 8,
										justifyContent: "space-between",
									}}
								>
									<Typography.Text strong ellipsis={{ tooltip: item.name }}>
										{item.name}
									</Typography.Text>
									<Tag color="blue" style={{ width: "fit-content" }}>
										₱{item.price}
									</Tag>

									<div
										style={{ display: "flex", justifyContent: "space-between" }}
									>
										<Badge
											color={getStockBadgeColor(item?.availableUnits)}
											text={
												item?.availableUnits <= 0
													? "Out of stock"
													: item?.availableUnits <= 5
													? `Only ${item?.availableUnits} left!`
													: `${item?.availableUnits} in stock`
											}
										/>
										<Button
											type="primary"
											shape="circle"
											icon={<PlusOutlined />}
											onClick={() => handleAddToCart(item)}
										/>
									</div>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			</div>

			<div style={{ marginTop: 16, textAlign: "center" }}>
				<Pagination
					current={currentPage}
					pageSize={PAGE_SIZE}
					total={data.length}
					onChange={(page) => setCurrentPage(page)}
					showSizeChanger={false}
				/>
			</div>
		</div>
	);
};

export default ItemPosCard;
