import { Mutation, Sale } from "@/generated/graphql";
import { VOID_TRANSACTION } from "@/graphql/inventory/transactions";
import { requiredField } from "@/utils/helper";
import { useMutation } from "@apollo/client";
import { Button, Col, Form, Modal, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { MessageInstance } from "antd/es/message/interface";

interface ProductModalProps {
	open: boolean;
	record: Sale;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
}

const VoidTransactionModal = (props: ProductModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [form] = Form.useForm();
	const [voidSale, { loading }] = useMutation<Mutation>(VOID_TRANSACTION, {
		onCompleted: (data) => {
			if (data?.voidSale?.success) {
				messageApi.success(data?.voidSale?.message);
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

	const handleSubmit = () => {
		const value = form.getFieldsValue();
		voidSale({
			variables: {
				id: record?.id ?? "",
				voidReason: value.voidReason,
			},
		});
	};

	const handleDelete = (id: string) => {};

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
			footer={
				<>
					<Button onClick={onClose}>Cancel</Button>
					<Button
						onClick={() => handleSubmit()}
						type="primary"
						htmlType="submit"
						name="voidTransaction"
					>
						Void
					</Button>
				</>
			}
			width={1000}
			centered
			loading={loading}
		>
			<Form
				form={form}
				name="voidTransaction"
				layout="vertical"
				onFinish={handleSubmit}
			>
				<Row gutter={4}>
					<Col span={24}>
						<Form.Item
							label="Void Reason"
							name="voidReason"
							rules={requiredField}
						>
							<TextArea />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default VoidTransactionModal;
