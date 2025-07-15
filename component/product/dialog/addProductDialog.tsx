import { StyledDiv } from "@/component/style";
import {
	Mutation,
	Product,
	ProductIngredient,
	Query,
} from "@/generated/graphql";
import { GET_ITEMS } from "@/graphql/inventory/items";
import { ADD_PRODUCT } from "@/graphql/inventory/products";
import { useModal } from "@/hooks/useModal";
import { requiredField } from "@/utils/helper";
import { useMutation, useQuery } from "@apollo/client";
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
import { useState } from "react";
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
	const [ingredients, setIngredients] = useState<ProductIngredient[]>(
		record?.ingredientsUsed ?? []
	);
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
	const {
		data,
		loading: loadingItem,
		refetch: refetchItem,
	} = useQuery<Query>(GET_ITEMS);

	const [addProduct, { loading }] = useMutation<Mutation>(ADD_PRODUCT, {
		onCompleted: (data) => {
			if (data) {
				messageApi.success("Product updated successfully");
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error("Something went wrong");
			}
		},
	});

	const handleCloseModal = () => {
		Modal.destroyAll();
		form.resetFields();
		onClose();
	};
	const handleAddItem = () => {
		let items = data?.items ?? ([] as ProductIngredient[]);
		const newItems = items.filter(
			(item) =>
				selectedValues.includes(item.id) &&
				!ingredients.some((ing) => ing.item.id === item.id)
		);
		if (selectedValues.length === 0) {
			messageApi.error("Please select at least one item");
			return;
		}
		if (newItems.length === 0) {
			messageApi.error("All selected items already added");
			return;
		}

		const productIngredients = newItems.map((item) => ({
			item: {
				id: item.id,
				name: "name" in item ? item.name : "",
				unit: "unit" in item ? item.unit : "",
				pricePerUnit: "pricePerUnit" in item ? item.pricePerUnit : 0,
			},
			quantityUsed: 1,
		}));

		setIngredients([
			...ingredients,
			...(productIngredients as ProductIngredient[]),
		]);
		setSelectedValues([]);
	};

	const handleDecrement = (id: number) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item.id === id) {
				return {
					...ingredient,
					quantityUsed: ingredient.quantityUsed - 1,
				};
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleIncrement = (id: number) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item.id === id) {
				return {
					...ingredient,
					quantityUsed: ingredient.quantityUsed + 1,
				};
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleQuantityChange = (id: number, value: number) => {
		const adjustedQty = ingredients?.map((ingredient) => {
			if (ingredient.item.id === id) {
				return {
					...ingredient,
					quantityUsed: value,
				};
			}
			return ingredient;
		});
		setIngredients(adjustedQty);
	};

	const handleSubmit = (values: Product) => {
		try {
			if (ingredients?.length === 0) {
				messageApi.error("Please add at least one ingredients");
				return;
			}
			const itemsPayload = ingredients?.map((ingredient) => ({
				itemId: ingredient.item.id,
				quantityUsed: ingredient.quantityUsed,
			}));

			const invalidQuantities = itemsPayload.filter(
				(item) => item.quantityUsed <= 0
			);

			if (invalidQuantities.length > 0) {
				messageApi.error("Quantity of each ingredient must be at least 1");
				return;
			}
			const payload = {
				id: record?.id,
				name: values.name,
				price: values.price,
				items: itemsPayload,
			};
			addProduct({
				variables: {
					...payload,
				},
			});
		} catch (e: Error | any) {
			messageApi.error(e.message);
		}
	};

	const handleDelete = (id: string) => {
		setIngredients(
			ingredients?.filter((ingredient) => ingredient?.item.id !== id)
		);
	};

	const columns: TableProps<ProductIngredient>["columns"] = [
		{
			title: "Name",
			dataIndex: ["item", "name"],
			key: "name",
			width: 250,
		},
		{
			title: "Unit",
			dataIndex: ["item", "unit"],
			key: "unit",
			width: "10%",
		},
		{
			title: "Quantity",
			dataIndex: "quantityUsed",
			key: "quantityUsed",
			width: "25%",
			align: "center",
			render: (_, record: ProductIngredient) => (
				<>
					<Button size="small" onClick={() => handleDecrement(record?.item.id)}>
						-
					</Button>
					<InputNumber
						value={record?.quantityUsed}
						onChange={(value) =>
							value !== null && handleQuantityChange(record?.item.id, value)
						}
						min={0}
						style={{ margin: "0 10px", width: 50 }}
					/>
					<Button size="small" onClick={() => handleIncrement(record?.item.id)}>
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
			render: (_, record: ProductIngredient) =>
				`₱${(record?.quantityUsed * record?.item.pricePerUnit).toFixed(2)}`,
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			width: "10%",
			align: "center",
			fixed: "right",
			render: (_, record: ProductIngredient) => (
				<Button danger onClick={() => handleDelete(record?.item.id)}>
					Delete
				</Button>
			),
		},
	];
	console.log("ingredients", ingredients);

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
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
							options={data?.items.map((item) => ({
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
								rowKey={(record) => record.item.id.toString()}
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
