import { CartProduct, pesoFormatter } from "@/utils/helper";
import { Button, InputNumber, Table, TableProps } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import RemoveItemConfirmModal from "./dialog/removeItemConfirmModal";

interface IProps {
	cart: CartProduct[];
	setCart: React.Dispatch<React.SetStateAction<CartProduct[]>>;
	messageApi: MessageInstance;
	hasOrderNo: boolean; // Indicates if this is a loaded order
}

const PosListTable = (props: IProps) => {
	const { cart, setCart, messageApi, hasOrderNo } = props;
	const [removeModalOpen, setRemoveModalOpen] = useState(false);
	const [itemToRemove, setItemToRemove] = useState<CartProduct | null>(null);

	const handleRemoveToCart = (record: CartProduct) => {
		if (hasOrderNo) {
			// If order is loaded, show password confirmation
			setItemToRemove(record);
			setRemoveModalOpen(true);
		} else {
			// Direct removal for new orders
			setCart((prevCart) => prevCart.filter((item) => item?._id !== record?._id));
		}
	};

	const handleConfirmRemove = () => {
		if (itemToRemove) {
			setCart((prevCart) => prevCart.filter((item) => item?._id !== itemToRemove?._id));
			setItemToRemove(null);
		}
	};

	const handleQuantityChange = (id: string, value: number) => {
		setCart((prevCart) =>
			prevCart.map((item) =>
				item?._id === id ? { ...item, quantity: value } : item
			)
		);
	};

	const column: TableProps<CartProduct>["columns"] = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "50%",
			fixed: "left",
		},
		{
			title: "Quantity",
			key: "quantity",
			width: "15%",
			render: (_, record: CartProduct) => {
				return (
					<>
						<InputNumber
							min={1}
							value={record?.quantity}
							style={{ width: 50 }}
							onChange={(value) => {
								handleQuantityChange(record?._id, value ?? 0);
							}}
						/>
					</>
				);
			},
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			align: "right",
			width: "15%",
			render: (pricePerUnit: number) => pesoFormatter(pricePerUnit),
		},
		{
			title: "Total Price",
			dataIndex: "price",
			key: "price",
			align: "right",
			width: "15%",
			render: (pricePerUnit: number, record: CartProduct) => {
				return (
					<span style={{ fontWeight: "bold" }}>
						{pesoFormatter(pricePerUnit * (record?.quantity ?? 0))}
					</span>
				);
			},
		},
		{
			title: "Action",
			key: "action",
			width: "10%",
			align: "center",
			render: (_, record: CartProduct) => {
				return (
					<Button
						size="small"
						danger
						onClick={() => {
							handleRemoveToCart(record);
						}}
					>
						Remove
					</Button>
				);
			},
		},
	];

	return (
		<div className="full">
			<Table
				showHeader={false}
				rowKey={(record: CartProduct) => record?._id?.toString() ?? ''}
				columns={column}
				size="middle"
				bordered={false}
				dataSource={cart as CartProduct[]}
				scroll={{ x: "max-content" }}
				pagination={{
					pageSize: 10,
				}}
			/>
			<RemoveItemConfirmModal
				open={removeModalOpen}
				itemName={itemToRemove?.name || ""}
				onClose={() => {
					setRemoveModalOpen(false);
					setItemToRemove(null);
				}}
				onConfirm={handleConfirmRemove}
				messageApi={messageApi}
			/>
		</div>
	);
};

export default PosListTable;
