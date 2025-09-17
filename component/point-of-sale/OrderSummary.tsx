import { Cart } from "@/utils/carts";
import { formatPeso } from "@/utils/helper";
import { Tag, Typography } from "antd";
import React from "react";

type OrderSummaryProps = {
	cart: Cart;
	totalAmount: number;
	title?: string;
	serviceType?: string | null;
	tableNo?: number | null;
	paymentMethod?: string;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
	cart,
	totalAmount,
	title = "Items",
	serviceType,
	tableNo,
	paymentMethod,
}) => {
	if (!cart?.saleItems.length) {
		return <Typography.Text type="secondary">No items yet.</Typography.Text>;
	}

	return (
		<>
			{/* Order Details Section */}
			<Typography.Title level={5} style={{ marginBottom: 8 }}>
				Order Details
			</Typography.Title>
			<div style={{ marginBottom: 12 }}>
				<Typography.Text strong>Order Type: </Typography.Text>{" "}
				<Typography.Text>{serviceType || "—"}</Typography.Text>
				<br />
				<Typography.Text strong>Table Number:</Typography.Text>{" "}
				<Typography.Text>{tableNo || "—"}</Typography.Text>
				<br />
			</div>

			{/* Items Section */}
			<Typography.Title level={5} style={{ marginBottom: 8 }}>
				{title}
			</Typography.Title>

			<ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
				{cart?.saleItems.map((item) => {
					const key = item?.tempKey ?? item?.productId ?? item?.tempKey;
					const status = item?.fromDb ? "Ordered" : "New";
					const subtotal = item.price * item.quantity;

					return (
						<li
							key={key}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "6px 0",
								borderBottom: "1px dashed #f0f0f0",
							}}
						>
							<div
								style={{
									display: "flex",
									gap: 8,
									alignItems: "center",
									flexWrap: "wrap",
									minWidth: 0,
								}}
							>
								<Typography.Text strong ellipsis>
									{item.name}
								</Typography.Text>
								<Typography.Text type="secondary">
									× {item.quantity}
								</Typography.Text>
								<Typography.Text type="secondary">
									@ {formatPeso(item.price)}
								</Typography.Text>
								<Tag
									color={item.fromDb ? "gold" : "green"}
									style={{ marginInlineStart: 0 }}
								>
									{status}
								</Tag>
							</div>

							<Typography.Text strong>{formatPeso(subtotal)}</Typography.Text>
						</li>
					);
				})}
			</ul>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					marginTop: 12,
				}}
			>
				<Typography.Title level={5} style={{ margin: 0 }}>
					Order Total
				</Typography.Title>
				<Typography.Title level={4} style={{ margin: 0 }}>
					{formatPeso(totalAmount)}
				</Typography.Title>
			</div>
		</>
	);
};

export default OrderSummary;
