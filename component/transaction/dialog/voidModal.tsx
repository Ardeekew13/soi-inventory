import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { useSupervisor } from "@/hooks/transaction";
import { supabase } from "@/lib/supabase-client";
import { Sale } from "@/lib/supabase.types";
import Void from "@/public/voidPc.svg";
import { Button, Form, Input, Modal, Select, Steps } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import Image from "next/image";
import { useState } from "react";

interface ProductModalProps {
	open: boolean;
	record: Sale;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
}

const { Step } = Steps;

const VoidTransactionModal = (props: ProductModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [form] = Form.useForm();
	const supervisor = useSupervisor();
	const [currentStep, setCurrentStep] = useState<number>(0);
	const { setTriggerRefetch } = useRefetchFlag();
	const [loading, setLoading] = useState(false);

	const voidReason = Form.useWatch("voidReason", form);
	const supervisorId = Form.useWatch("supervisorId", form);
	const password = Form.useWatch("passwordSupervisor", form);

	const next = async () => {
		const fieldsToValidate =
			currentStep === 0
				? ["voidReason", "supervisorId"]
				: ["passwordSupervisor"];
		try {
			await form.validateFields(fieldsToValidate);
			setCurrentStep((s) => s + 1);
		} catch {
			messageApi.error("Please contact support");
		}
	};

	const prev = () => setCurrentStep((prev) => prev - 1);

	const handleSubmit = async () => {
		setLoading(true);
		const value = form.getFieldsValue(true);

		const { data, error } = await supabase.rpc("void_sale", {
			p_sale_id: record?.id,
			p_void_reason: value.voidReason,
			p_supervisor_id: value.supervisorId,
			p_password: value.passwordSupervisor,
		});

		if (error) {
			messageApi.error(error.message || "Something went wrong");
			setLoading(false);
			return;
		}

		if (data?.success) {
			messageApi.success(data.message);
			setTriggerRefetch(true);
			form.resetFields();
			onClose();
			setLoading(false);
		} else {
			messageApi.error(data?.message ?? "Failed to void transaction");
			setLoading(false);
		}
	};

	return (
		<Modal
			closable={false}
			open={open}
			onCancel={onClose}
			footer={false}
			width={1000}
			centered
			loading={loading}
			title={
				<Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
					<Step title="Void Reason" />
					<Step title="Supervisor Verification" />
				</Steps>
			}
		>
			<Form form={form} layout="vertical" preserve>
				{currentStep === 0 && (
					<>
						<Form.Item
							name="voidReason"
							label="Reason"
							preserve
							rules={[
								{ required: true, message: "Please provide a void reason" },
							]}
						>
							<Input placeholder="Void Reason" />
						</Form.Item>

						<Form.Item
							name="supervisorId"
							label="Supervisor"
							preserve
							rules={[
								{ required: true, message: "Please select a supervisor" },
							]}
						>
							<Select placeholder="Select Supervisor" options={supervisor} />
						</Form.Item>
					</>
				)}

				{currentStep === 1 && (
					<>
						<Image
							src={Void}
							alt="Void"
							width={Void.width}
							height={Void.height}
							priority
							style={{
								width: "clamp(240px, 45vw, 460px)",
								height: "auto",
								maxHeight: "38vh",
								display: "block",
								margin: "0 auto 16px",
							}}
						/>

						<Form.Item
							name="passwordSupervisor"
							label="Supervisor Password"
							rules={[
								{
									required: true,
									message: "Please enter the supervisor password",
								},
							]}
						>
							<Input.Password placeholder="Enter password" />
						</Form.Item>
					</>
				)}

				<div style={{ textAlign: "right", marginTop: 8 }}>
					<Button onClick={onClose} style={{ marginRight: 8 }}>
						Cancel
					</Button>
					{currentStep > 0 && (
						<Button onClick={prev} style={{ marginRight: 8 }}>
							Previous
						</Button>
					)}
					{currentStep < 1 ? (
						<Button
							type="primary"
							onClick={next}
							disabled={currentStep === 0 && !(voidReason && supervisorId)}
						>
							Next
						</Button>
					) : (
						<Button
							type="primary"
							onClick={handleSubmit}
							loading={loading}
							disabled={!password}
						>
							Void
						</Button>
					)}
				</div>
			</Form>
		</Modal>
	);
};

export default VoidTransactionModal;
