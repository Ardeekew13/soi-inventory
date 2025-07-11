import { StyledDiv } from "@/component/style";
import { Sale, SaleItem } from "@/generated/graphql";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Table } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import dayjs from "dayjs";

interface ProductModalProps {
	open: boolean;
	onClose: () => void;
	record?: Sale;
	refetch: () => void;
	messageApi: MessageInstance;
}

const ViewTransactionModal = (props: ProductModalProps) => {
	const { open, onClose, record } = props;
	const [form] = Form.useForm();

	const handleCloseModal = () => {
		Modal.destroyAll();
		form.resetFields();
		onClose();
	};

	const columns: TableProps<SaleItem>["columns"] = [
		{
			title: "Product",
			dataIndex: ["product", "name"],
			key: "productName",
			width: 250,
		},
		{
			title: "Price at Sale",
			dataIndex: "priceAtSale",
			key: "priceAtSale",
			width: "20%",
			render: (price: number) => `₱${price}`,
		},
		{
			title: "Ingredients",
			key: "ingredients",
			render: (_: any, item: SaleItem) => (
				<ul style={{ paddingLeft: 16 }}>
					{item.product.ingredientsUsed.map((ingredient, index) => (
						<li key={index}>
							{ingredient.item.name} — {ingredient.quantityUsed}{" "}
							{ingredient.item.unit}
						</li>
					))}
				</ul>
			),
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
			width: "20%",
			align: "center",
		},
	];

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
			footer={
				<Button type="primary" onClick={() => handleCloseModal()}>
					Ok
				</Button>
			}
			width={1000}
			centered
		>
			<Form
				form={form}
				name="viewItem"
				layout="vertical"
				initialValues={{
					id: record?.id,
					createdAt: dayjs(record?.createdAt).format("MM/DD/YYYY hh:mm A"),
					costOfGoods: record?.costOfGoods.toFixed(2),
					totalAmount: record?.totalAmount.toFixed(2),
					grossProfit: record?.grossProfit.toFixed(2),
				}}
			>
				<Row gutter={4}>
					<Col span={24}>
						<Form.Item name="id" label="Transaction ID">
							<Input placeholder="Transaction ID" readOnly />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="createdAt" label="Transaction Date">
							<Input readOnly />
						</Form.Item>
					</Col>
					<Col lg={8}>
						<Form.Item name="costOfGoods" label="Cost Of Goods">
							<InputNumber
								placeholder="Price"
								readOnly
								style={{ width: "100%" }}
								formatter={(value) => `₱ ${value}`}
							/>
						</Form.Item>
					</Col>
					<Col lg={8}>
						<Form.Item name="totalAmount" label="Total Amount">
							<InputNumber
								readOnly
								style={{ width: "100%" }}
								formatter={(value) => `₱ ${value}`}
							/>
						</Form.Item>
					</Col>
					<Col lg={8}>
						<Form.Item name="grossProfit" label="Gross Profit">
							<InputNumber
								readOnly
								style={{ width: "100%" }}
								formatter={(value) => `₱ ${value}`}
							/>
						</Form.Item>
					</Col>
				</Row>

				<Row>
					<Col span={24}>
						<StyledDiv>
							<Table
								rowKey={(record) => record?.productId.toString()}
								columns={columns}
								dataSource={record?.saleItems ?? []}
								style={{ width: "100%" }}
								scroll={{ x: 800 }}
							/>
						</StyledDiv>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default ViewTransactionModal;
