import { useRefetchFlag } from "@/context/TriggerRefetchContext";

import { supabase } from "@/lib/supabase-client";
import { Item } from "@/lib/supabase.types";
import { requiredField } from "@/utils/helper";
import {
	Button,
	Col,
	Form,
	Input,
	InputNumber,
	Modal,
	Row,
	Space,
	Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

interface ItemModalProps {
	open: boolean;
	onClose: () => void;
	record?: Item;
	refetch: () => void;
	messageApi: MessageInstance;
}

const AddItemModal = (props: ItemModalProps) => {
	const { open, onClose, record, refetch, messageApi } = props;
	const [form] = Form.useForm();
	const { setTriggerRefetch } = useRefetchFlag();
	const [loading, setLoading] = useState(false);

	const handleCloseModal = () => {
		Modal.destroyAll();
		form.resetFields();
		onClose();
	};

	const handleSubmit = async (values: any) => {
		setLoading(true);
		try {
			let error;
			if (record?.id) {
				// Update existing item
				const { error: updateError } = await supabase
					.from("items")
					.update({
						name: values.name,
						unit: values.unit.toLowerCase(),
						price_per_unit: values.pricePerUnit,
						current_stock: values.currentStock,
					})
					.eq("id", record.id);
				error = updateError;
			} else {
				// Insert new item
				const { error: insertError } = await supabase.from("items").insert([
					{
						name: values.name,
						unit: values.unit.toLowerCase(),
						price_per_unit: values.pricePerUnit,
						current_stock: values.currentStock,
					},
				]);
				error = insertError;
			}

			if (error) {
				messageApi.error("Failed: " + error.message);
				return;
			}

			messageApi.success(
				`${record?.id ? "Item updated" : "Item added"} successfully`
			);
			refetch();
			form.resetFields();
			onClose();
			setTriggerRefetch(true);
		} catch (e: any) {
			messageApi.error(e.message);
		}
	};

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
			loading={loading}
			title={
				<Typography.Title level={4}>
					<Space align="center">{record?.id ? "Edit Item" : "Add Item"}</Space>
				</Typography.Title>
			}
			footer={
				<>
					<Button onClick={() => handleCloseModal()}>Cancel</Button>
					<Button type="primary" form="addItem" htmlType="submit">
						{record?.id ? "Update" : "Add"}
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
					name: record?.name ?? "",
					unit: record?.unit ?? "",
					pricePerUnit: record?.price_per_unit ?? "",
					currentStock: record?.current_stock ?? "",
				}}
			>
				<Row gutter={4}>
					<Col span={24}>
						<Form.Item name="name" label="Name" rules={requiredField}>
							<Input placeholder="Item Name" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="unit" label="Unit" rules={requiredField}>
							<Input placeholder="Unit of Measure" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="pricePerUnit" label="Price" rules={requiredField}>
							<InputNumber
								placeholder="Price Per Unit"
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

					<Col span={24}>
						<Form.Item
							name="currentStock"
							label="Current Stock"
							rules={requiredField}
						>
							<InputNumber
								style={{ width: "100%" }}
								placeholder="Current Stock Available"
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default AddItemModal;
