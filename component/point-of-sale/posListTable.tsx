import { CartProduct } from "@/utils/helper";
import { Button, InputNumber, Table, TableProps } from "antd";
import { MessageInstance } from "antd/es/message/interface";

interface IProps {
	cart: CartProduct[];
	setCart: React.Dispatch<React.SetStateAction<CartProduct[]>>;
	messageApi: MessageInstance;
}

const PosListTable = (props: IProps) => {
	const { cart, setCart, messageApi } = props;

	const handleRemoveToCart = (record: CartProduct) => {
		setCart((prevCart) => prevCart.filter((item) => item.id !== record.id));
	};

	const handleDecrement = (id: number) => {
		setCart((prevCart) =>
			prevCart.map((item) =>
				item.id === id ? { ...item, quantity: item.quantity - 1 } : item
			)
		);
	};

	const handleIncrement = (id: number) => {
		setCart((prevCart) =>
			prevCart.map((item) =>
				item.id === id ? { ...item, quantity: item.quantity - 1 } : item
			)
		);
	};

	const handleQuantityChange = (id: number, value: number) => {
		setCart((prevCart) =>
			prevCart.map((item) =>
				item.id === id ? { ...item, quantity: value } : item
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
				console.log("record", record);
				return (
					<>
						<InputNumber
							min={1}
							value={record.quantity}
							style={{ width: 50 }}
							onChange={(value) => {
								handleQuantityChange(record?.id, value ?? 0);
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
			render: (pricePerUnit: number) => `₱${pricePerUnit.toFixed(2)}`,
		},
		{
			title: "Total Price",
			dataIndex: "price",
			key: "price",
			align: "right",
			width: "15%",
			render: (pricePerUnit: number, record: CartProduct) => {
				return (
					<span style={{ fontWeight: "bold" }}>{`₱${
						pricePerUnit * record.quantity
					}`}</span>
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
	console.log("cart", cart);
	return (
		<div className="full">
			<Table
				showHeader={false}
				rowKey={(record: CartProduct) => record?.id.toString()}
				columns={column}
				size="middle"
				bordered={false}
				dataSource={cart as CartProduct[]}
				scroll={{ x: "max-content" }}
				pagination={{
					pageSize: 10,
				}}
			/>
		</div>
	);
};

export default PosListTable;
