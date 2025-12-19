import { Mutation, Sale } from "@/generated/graphql";
import { VOID_TRANSACTION, REFUND_SALE } from "@/graphql/inventory/transactions";
import { useMutation } from "@apollo/client";
import { Button, Modal, Radio, Space, Typography, Alert } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import PasswordConfirmation from "@/component/common/PasswordConfirmation";

interface ProductModalProps {
	open: boolean;
	record: Sale;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
}

const VoidTransactionModal = (props: ProductModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [action, setAction] = useState<"void" | "refund">("refund");
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const [voidSale, { loading: voidLoading }] = useMutation<Mutation>(VOID_TRANSACTION, {
		onCompleted: (data) => {
			if (data?.voidSale?.success) {
				messageApi.success(data?.voidSale?.message);
				refetch();
				handleCloseModal();
			} else {
				messageApi.error(data?.voidSale?.message || "Something went wrong");
			}
		},
		onError: (error) => {
			messageApi.error("Failed to void transaction");
			console.error("Void error:", error);
		},
	});

	const [refundSale, { loading: refundLoading }] = useMutation<Mutation>(REFUND_SALE, {
		onCompleted: (data) => {
			if (data?.refundSale?.success) {
				messageApi.success(data?.refundSale?.message);
				refetch();
				handleCloseModal();
			} else {
				messageApi.error(data?.refundSale?.message || "Something went wrong");
			}
		},
		onError: (error) => {
			messageApi.error("Failed to refund transaction");
			console.error("Refund error:", error);
		},
	});

	const handlePasswordVerified = async () => {
		if (!record?._id) {
			messageApi.error("No transaction ID found");
			return;
		}

		if (action === "void") {
			// Void the transaction (no inventory return)
			await voidSale({
				variables: {
					id: record._id,
					voidReason: "Voided by authorized user - no inventory return",
				},
			});
		} else if (action === "refund") {
			// Refund - returns ingredients to inventory (ONLY for COMPLETED sales)
			if (record.status !== "COMPLETED") {
				messageApi.error("Can only refund completed sales");
				return;
			}
			
			await refundSale({
				variables: {
					id: record._id,
					refundReason: "Refunded by authorized user",
				},
			});
		}
	};

	const handleCloseModal = () => {
		Modal.destroyAll();
		setAction("refund");
		setShowPasswordModal(false);
		onClose();
	};

	const handleProceed = () => {
		if (action === "refund" && record.status !== "COMPLETED") {
			messageApi.error("Can only refund completed sales");
			return;
		}
		setShowPasswordModal(true);
	};

	const isCompleted = record?.status === "COMPLETED";

	return (
		<>
			<Modal
				destroyOnHidden={true}
				maskClosable={false}
				open={open && !showPasswordModal}
				onCancel={handleCloseModal}
				title={isCompleted ? "Refund or Void Transaction" : "Void Transaction"}
				footer={
					<>
						<Button onClick={handleCloseModal}>Cancel</Button>
						<Button
							onClick={handleProceed}
							type="primary"
							danger
							loading={voidLoading || refundLoading}
						>
							Proceed to Verify
						</Button>
					</>
				}
				width={600}
				centered
			>
				<Space direction="vertical" style={{ width: "100%" }} size={16}>
					{!isCompleted && (
						<Alert
							message="This transaction is not completed yet"
							description="Voiding will not return ingredients to inventory since the sale was not completed."
							type="warning"
							showIcon
						/>
					)}
					
					{isCompleted && (
						<Alert
							message="✅ Completed Sale"
							description="You can refund this sale to return ingredients to inventory, or void it without inventory return."
							type="info"
							showIcon
						/>
					)}

					<div>
						<Typography.Text strong>Select Action:</Typography.Text>
						<Radio.Group
							value={action}
							onChange={(e) => setAction(e.target.value)}
							style={{ marginTop: 8, width: "100%" }}
						>
							<Space direction="vertical">
								{isCompleted && (
									<Radio value="refund">
										<strong>Refund (Recommended)</strong> - Return ingredients to inventory and cancel transaction
										<Typography.Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
											This will add the ingredients back to your inventory and deduct from cash drawer.
										</Typography.Text>
									</Radio>
								)}
								<Radio value="void">
									<strong>Void</strong> - Cancel transaction without inventory return
									<Typography.Text type="secondary" style={{ display: 'block', marginLeft: 24 }}>
										{isCompleted 
											? "Ingredients will NOT be returned. Only use if items are damaged/lost."
											: "Mark this transaction as voided."
										}
									</Typography.Text>
								</Radio>
							</Space>
						</Radio.Group>
					</div>
				</Space>
			</Modal>

			<PasswordConfirmation
				open={showPasswordModal}
				title={action === "void" ? "Void Transaction" : "Refund Transaction"}
				description={
					action === "void"
						? "You are about to void this transaction. Ingredients will NOT be returned. Please enter your password to confirm."
						: "You are about to refund this transaction. Ingredients will be returned to inventory and amount deducted from cash drawer. Please enter your password to confirm."
				}
				onClose={() => setShowPasswordModal(false)}
				onConfirm={handlePasswordVerified}
				messageApi={messageApi}
				confirmButtonText={action === "void" ? "Verify and Void" : "Verify and Refund"}
			/>
		</>
	);
};

export default VoidTransactionModal;
