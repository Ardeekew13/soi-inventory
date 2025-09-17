import { StyledDiv } from "@/component/style";
import { useModal } from "@/hooks/useModal";
import { supabase } from "@/lib/supabase-client";
import { Item, Product, ProductIngredientDTO } from "@/lib/supabase.types";
import { formatPeso, requiredField } from "@/utils/helper";
import {
	Button,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Row,
	Select,
	Space,
	Table,
	Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import InventoryListModal from "./inventoryListModal";

interface ProductModalProps {
	open: boolean;
	onClose: () => void;
	record?: Product;
	refetch: () => void;
	messageApi: MessageInstance;
}

const AddProductModal = (props: ProductModalProps) => {
	const { open, onClose, record, refetch, messageApi } = props;
	const [form] = Form.useForm();
	const [ingredients, setIngredients] = useState<ProductIngredientDTO[]>(
		record?.ingredients ?? []
	);

	const [items, setItems] = useState<Item[]>([]);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchItems = async () => {
			const { data, error } = await supabase.from("items").select("*");
			if (error) {
				messageApi.error("Failed to load items");
			} else {
				setItems(data ?? []);
			}
		};
		fetchItems();
	}, [messageApi]);

	const handleCloseModal = () => {
		form.resetFields();
		onClose();
		setIngredients([]);
		setSelectedValues([]);
	};

	const handleAddItem = () => {
		const newItems: ProductIngredientDTO[] = items
			.filter(
				(item) =>
					selectedValues.includes(item.id) &&
					!ingredients.some((ing) => ing.item_id === item.id)
			)
			.map((item) => ({
				item_id: item.id,
				qty: 1,
				item_name: item.name,
				unit: item?.unit,
			}));

		if (newItems.length === 0) {
			messageApi.error("No new items selected");
			return;
		}

		setIngredients([...ingredients, ...newItems]);
		setSelectedValues([]);
	};

	const handleDecrement = (id: string) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item_id === id) {
				return {
					...ingredient,
					qty: ingredient.qty - 1,
				};
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleIncrement = (id: string) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item_id === id) {
				return { ...ingredient, qty: ingredient.qty + 1 };
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleQuantityChange = (id: string, value: number) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item_id === id) {
				return { ...ingredient, qty: value };
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleSubmit = async (values: Product) => {
		try {
			if (ingredients.length === 0) {
				messageApi.error("Please add at least one ingredient");
				return;
			}

			const itemsPayload = ingredients.map((ingredient) => ({
				item_id: ingredient.item_id,
				qty: ingredient.qty,
				unit: ingredient?.unit,
			}));

			const invalidQuantities = itemsPayload.filter((i) => i.qty <= 0);
			if (invalidQuantities.length > 0) {
				messageApi.error("Quantity must be at least 1");
				return;
			}

			setLoading(true);

			let result;
			if (record?.id) {
				result = await supabase.rpc("update_product", {
					p_id: record.id,
					p_name: values.name,
					p_price: values.price,
					p_is_active: true,
					p_items: itemsPayload,
				});
			} else {
				result = await supabase.rpc("add_product", {
					p_name: values.name,
					p_price: values.price,
					p_is_active: true,
					p_items: itemsPayload,
				});
			}

			const { error, data } = result;
			console.log("data", data);
			setLoading(false);
			if (data?.success) {
				messageApi.success(data.message);
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error(data?.message);
			}
		} catch (e: any) {
			setLoading(false);
			messageApi.error(e.message);
		}
	};

	const handleDelete = (id: string) => {
		setIngredients(
			ingredients?.filter((ingredient) => ingredient?.item_id !== id)
		);
	};

	const columns: TableProps<ProductIngredientDTO>["columns"] = [
		{
			title: "Name",
			dataIndex: "item_name",
			key: "item_name",
			width: 250,
		},
		{
			title: "Unit",
			dataIndex: "unit",
			key: "unit",
			width: "10%",
		},
		{
			title: "Quantity",
			dataIndex: "qty",
			key: "qty",
			width: "25%",
			align: "center",
			render: (_, record) => (
				<>
					<Button size="small" onClick={() => handleDecrement(record?.item_id)}>
						-
					</Button>
					<InputNumber
						value={record?.qty}
						onChange={(value) =>
							value !== null && handleQuantityChange(record?.item_id, value)
						}
						min={0}
						style={{ margin: "0 10px", width: 50 }}
					/>
					<Button size="small" onClick={() => handleIncrement(record?.item_id)}>
						+
					</Button>
				</>
			),
		},
		{
			title: "Total Price",
			dataIndex: "totalPrice",
			key: "totalPrice",
			width: "15%",
			align: "right",
			render: (_, record) =>
				`${formatPeso(
					record.qty *
						(items.find((i) => i.id === record.item_id)?.price_per_unit ?? 0)
				)}`,
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			width: "10%",
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Button danger onClick={() => handleDelete(record.item_id)}>
					Delete
				</Button>
			),
		},
	];
	console.log("record", record);
	console.log("ingredients", ingredients);
	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={handleCloseModal}
			width={1000}
			centered
			loading={loading}
			title={
				<Typography.Title level={4}>
					<Space align="center">
						{record?.id ? "Edit Product" : "Add Product"}
					</Space>
				</Typography.Title>
			}
			footer={
				<>
					<Button onClick={() => handleCloseModal()}>Cancel</Button>
					<Button type="primary" form="addItem" htmlType="submit">
						{record?.id ? "Update Product" : "Add Product"}
					</Button>
				</>
			}
		>
			<Form
				form={form}
				name="addItem"
				layout="vertical"
				onFinish={handleSubmit}
				initialValues={{
					name: record?.name,
					price: record?.price,
				}}
			>
				<Row gutter={4}>
					<Col span={24}>
						<Form.Item name="name" label="Name" rules={requiredField}>
							<Input placeholder="Item Name" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="price" label="Price" rules={requiredField}>
							<InputNumber
								placeholder="Price"
								style={{ width: "100%" }}
								formatter={(value) =>
									`₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								parser={(value) =>
									value?.replace(/\₱\s?|(,*)/g, "") as unknown as number
								}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col lg={20} sm={16} xs={16}>
						<Select
							mode="multiple"
							showSearch
							value={selectedValues}
							filterOption={(input, option) =>
								(option?.label ?? "")
									.toLowerCase()
									.includes(input.toLowerCase())
							}
							options={items.map((item) => ({
								label: item.name,
								value: item.id,
							}))}
							onChange={(values) => setSelectedValues(values)}
							placeholder="Select ingredients"
							style={{ width: "100%" }}
						/>
					</Col>
					<Col lg={4} sm={8} xs={8}>
						<Button
							type="primary"
							onClick={() => handleAddItem()}
							style={{ width: "100%" }}
						>
							{isMobile ? "Add" : "Add Ingredients"}
						</Button>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<InventoryListModal open={isModalOpen} onClose={closeModal} />
						<StyledDiv>
							<Table
								rowKey={(record): string => record.item_id as string}
								columns={columns}
								dataSource={ingredients}
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

export default AddProductModal;
