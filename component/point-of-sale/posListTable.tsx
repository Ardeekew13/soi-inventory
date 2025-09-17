import { Cart, CartLine } from "@/utils/carts";
import { formatPeso } from "@/utils/helper";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, InputNumber, Table, TableProps, Tag } from "antd";
import { MessageInstance } from "antd/es/message/interface";

interface IProps {
	cart: Cart;
	setCart: React.Dispatch<React.SetStateAction<Cart>>;
	messageApi: MessageInstance;
	type: string;
}

const PosListTable = (props: IProps) => {
	const { cart, setCart, messageApi } = props;

	const handleRemoveToCart = (record: CartLine) => {
		console.log("record", record);
		setCart((prevCart) => ({
			...prevCart,
			saleItems: prevCart.saleItems.filter(
				(item) => item.productId !== record.productId
			),
		}));
	};

	const handleQuantityChange = (saleId: string, value: number) => {
		setCart((prevCart: Cart) => ({
			...prevCart,
			saleItems: prevCart.saleItems.map((saleItem: CartLine) =>
				saleItem.productId === saleId
					? { ...saleItem, quantity: value }
					: saleItem
			),
		}));
	};

	const column: TableProps<CartLine>["columns"] = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "25%",
			fixed: "left",
		},
		{
			title: "Status",
			key: "status",
			width: "20%",
			render: (_: any, record: CartLine) =>
				record?.fromDb ? (
					<Tag color="blue">Ordered</Tag>
				) : (
					<Tag color="green">New</Tag>
				),
		},
		{
			title: "Quantity",
			key: "quantity",
			width: "15%",
			render: (_, record: CartLine) => {
				return (
					<>
						<InputNumber
							min={1}
							value={record?.quantity}
							style={{ width: 50 }}
							onChange={(value) => {
								handleQuantityChange(record.productId, value ?? 0);
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
			width: "20%",
			render: (pricePerUnit: number) => formatPeso(pricePerUnit),
		},
		{
			title: "Total Price",
			dataIndex: "price",
			key: "price",
			width: "20%",
			render: (pricePerUnit: number, record: CartLine) => {
				return (
					<>
						<span style={{ fontWeight: "bold" }}>{`₱${
							pricePerUnit * record?.quantity
						}`}</span>
					</>
				);
			},
		},
		{
			title: "Action",
			key: "action",
			width: "10%",
			align: "center",
			fixed: "right",
			render: (_, record: CartLine) => {
				return (
					<Button
						size="small"
						danger
						onClick={() => {
							handleRemoveToCart(record);
						}}
					>
						<DeleteOutlined color="red" />
					</Button>
				);
			},
		},
	];

	return (
		<div className="full">
			<Table
				showHeader={false}
				rowKey={(record) => record.tempKey}
				columns={column}
				size="middle"
				bordered={false}
				dataSource={cart?.saleItems as CartLine[]}
				scroll={{ x: 100 }}
				pagination={{
					pageSize: 10,
				}}
			/>
		</div>
	);
};

export default PosListTable;
