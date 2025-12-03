"use client";
import { CREATE_SERVICE_CHARGE, UPDATE_SERVICE_CHARGE } from "@/graphql/settings/settings";
import { requiredField } from "@/utils/helper";
import { useMutation } from "@apollo/client";
import { Button, Col, Form, Input, InputNumber, Modal, Row } from "antd";
import { MessageInstance } from "antd/es/message/interface";

interface ServiceCharge {
	_id: string;
	id: string;
	title: string;
	value: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ServiceChargeModalProps {
	open: boolean;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
	record: ServiceCharge | null;
}

const AddServiceChargeDialog = (props: ServiceChargeModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [form] = Form.useForm();

	const [createServiceCharge, { loading: creating }] = useMutation(CREATE_SERVICE_CHARGE, {
		onCompleted: (data) => {
			if (data?.createServiceCharge?.success) {
				messageApi.success(data?.createServiceCharge?.message);
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error(data?.createServiceCharge?.message || "Failed to create service charge");
			}
		},
		onError: () => {
			messageApi.error("An error occurred while creating service charge");
		},
	});

	const [updateServiceCharge, { loading: updating }] = useMutation(UPDATE_SERVICE_CHARGE, {
		onCompleted: (data) => {
			if (data?.updateServiceCharge?.success) {
				messageApi.success(data?.updateServiceCharge?.message);
				refetch();
				form.resetFields();
				onClose();
			} else {
				messageApi.error(data?.updateServiceCharge?.message || "Failed to update service charge");
			}
		},
		onError: () => {
			messageApi.error("An error occurred while updating service charge");
		},
	});

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			
			if (record) {
				// Update existing service charge
				await updateServiceCharge({
					variables: {
						id: record._id,
						input: {
							title: values.title,
							value: values.value,
						},
					},
				});
			} else {
				// Create new service charge
				await createServiceCharge({
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
			title={record ? "Edit Service Charge" : "Add New Service Charge"}
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
				name="serviceChargeForm"
				layout="vertical"
				initialValues={record ? {
					title: record.title,
					value: record.value,
				} : {}}
			>
				<Row gutter={16}>
					<Col span={24}>
						<Form.Item
							label="Service Charge Title"
							name="title"
							rules={requiredField}
						>
							<Input placeholder="Enter service charge title (e.g., Standard Service Fee)" size="large" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							label="Service Charge Value (%)"
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

export default AddServiceChargeDialog;
