"use client";
import { CREATE_DISCOUNT, UPDATE_DISCOUNT } from "@/graphql/settings/settings";
import { requiredField } from "@/utils/helper";
import { useMutation } from "@apollo/client";
import { Button, Col, Form, Input, InputNumber, Modal, Row } from "antd";
import { MessageInstance } from "antd/es/message/interface";

interface Discount {
	_id: string;
	id: string;
	title: string;
	value: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface DiscountModalProps {
	open: boolean;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
	record: Discount | null;
}

const AddDiscountDialog = (props: DiscountModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [form] = Form.useForm();

	const [createDiscount, { loading: creating }] = useMutation(CREATE_DISCOUNT, {
		onCompleted: (data) => {
			if (data?.createDiscount?.success) {
				messageApi.success(data?.createDiscount?.message);
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error(data?.createDiscount?.message || "Failed to create discount");
			}
		},
		onError: () => {
			messageApi.error("An error occurred while creating discount");
		},
	});

	const [updateDiscount, { loading: updating }] = useMutation(UPDATE_DISCOUNT, {
		onCompleted: (data) => {
			if (data?.updateDiscount?.success) {
				messageApi.success(data?.updateDiscount?.message);
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error(data?.updateDiscount?.message || "Failed to update discount");
			}
		},
		onError: () => {
			messageApi.error("An error occurred while updating discount");
		},
	});

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			
			if (record) {
				// Update existing discount
				await updateDiscount({
					variables: {
						id: record._id,
						input: {
							title: values.title,
							value: values.value,
						},
					},
				});
			} else {
				// Create new discount
				await createDiscount({
					variables: {
						input: {
							title: values.title,
							value: values.value,
						},
					},
				});
			}
		} catch (error) {
			console.error("Form validation failed:", error);
		}
	};

	const handleCloseModal = () => {
		form.resetFields();
		onClose();
	};

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={handleCloseModal}
			title={record ? "Edit Discount" : "Add New Discount"}
			footer={
				<>
					<Button onClick={handleCloseModal}>Cancel</Button>
					<Button
						type="primary"
						onClick={handleSubmit}
						loading={creating || updating}
					>
						{record ? "Update" : "Create"}
					</Button>
				</>
			}
			width={500}
			centered
		>
			<Form
				form={form}
				name="discountForm"
				layout="vertical"
				initialValues={record ? {
					title: record.title,
					value: record.value,
				} : {}}
			>
				<Row gutter={16}>
					<Col span={24}>
						<Form.Item
							label="Discount Title"
							name="title"
							rules={requiredField}
						>
							<Input placeholder="Enter discount title (e.g., Senior Citizen)" size="large" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							label="Discount Value (%)"
							name="value"
							rules={[
								...requiredField,
								{
									type: "number",
									min: 0,
									max: 100,
									message: "Value must be between 0 and 100",
								},
							]}
						>
							<InputNumber
								placeholder="Enter percentage value"
								style={{ width: "100%" }}
								size="large"
								min={0}
								max={100}
								formatter={(value) => `${value}%`}
								parser={(value) => value?.replace('%', '') as any}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default AddDiscountDialog;
