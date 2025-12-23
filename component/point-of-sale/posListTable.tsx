import { CartProduct, pesoFormatter } from "@/utils/helper";
import { Button, InputNumber, Table, TableProps } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
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
	
	// Responsive breakpoints
	const isMobile = useMediaQuery({ maxWidth: 767 });
	const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
	const isDesktop = useMediaQuery({ minWidth: 1024 });

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
			ellipsis: true,
			render: (name: string, record: CartProduct) => (
				<div>
					<div style={{ 
						fontWeight: 500, 
						fontSize: isMobile ? 13 : 14,
						wordBreak: 'break-word'
					}}>
						{name}
					</div>
					{isMobile && (
						<div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
							₱{record.price.toFixed(2)} × {record.quantity} = ₱{(record.price * record.quantity).toFixed(2)}
						</div>
					)}
				</div>
			),
		},
		{
			title: "Qty",
			key: "quantity",
			width: isMobile ? 70 : isTablet ? 90 : 100,
			align: "center",
			render: (_, record: CartProduct) => {
				return (
					<InputNumber
						min={1}
						value={record?.quantity}
						size={isMobile ? "small" : "middle"}
						style={{ width: isMobile ? 55 : 70 }}
						onChange={(value) => {
							handleQuantityChange(record?._id, value ?? 0);
						}}
					/>
				);
			},
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			align: "right",
			width: 80,
			responsive: ['md'] as any,
			render: (pricePerUnit: number) => (
				<span style={{ fontSize: 13 }}>
					{pesoFormatter(pricePerUnit)}
				</span>
			),
		},
		{
			title: "Total",
			dataIndex: "price",
			key: "totalPrice",
			align: "right",
			width: isMobile ? 0 : isTablet ? 90 : 100,
			responsive: isMobile ? ['sm'] as any : undefined,
			render: (pricePerUnit: number, record: CartProduct) => {
				return (
					<span style={{ 
						fontWeight: "bold", 
						fontSize: isMobile ? 13 : 14,
						color: '#1890ff'
					}}>
						{pesoFormatter(pricePerUnit * (record?.quantity ?? 0))}
					</span>
				);
			},
		},
		{
			title: "",
			key: "action",
			width: isMobile ? 55 : 85,
			align: "center",
			fixed: isMobile ? undefined : "right",
			render: (_, record: CartProduct) => {
				return (
					<Button
						size="small"
						danger
						onClick={() => {
							handleRemoveToCart(record);
						}}
					>
						{isMobile ? '✕' : 'Remove'}
					</Button>
				);
			},
		},
	];

	return (
		<div className="full">
			<Table
				showHeader={!isMobile}
				rowKey={(record: CartProduct) => record?._id?.toString() ?? ''}
				columns={column}
				size={isMobile ? "small" : "middle"}
				bordered={false}
				dataSource={cart as CartProduct[]}
				scroll={{ x: isMobile ? 350 : undefined }}
				pagination={{
					pageSize: isMobile ? 4 : isTablet ? 6 : 8,
					simple: isMobile,
					size: "small",
					showSizeChanger: false,
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
