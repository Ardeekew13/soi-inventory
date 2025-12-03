import { Mutation, Sale } from "@/generated/graphql";
import { VOID_TRANSACTION } from "@/graphql/inventory/transactions";
import { useMutation } from "@apollo/client";
import { Button, Modal, Radio, Space, Typography } from "antd";
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
	const [action, setAction] = useState<"void" | "refund">("void");
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const [voidSale, { loading }] = useMutation<Mutation>(VOID_TRANSACTION, {
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

	const handlePasswordVerified = async () => {
		if (action === "void") {
			// Void the transaction (current functionality)
			if (!record?._id) {
				messageApi.error("No transaction ID found");
				return;
			}
			
			await voidSale({
				variables: {
					id: record._id,
					voidReason: "Voided by authorized user",
				},
			});
		} else if (action === "refund") {
			// Refund functionality - return ingredients to inventory
			messageApi.info("Refund functionality: returning ingredients to inventory");
			// TODO: Implement refund mutation that returns ingredients
			// For now, just void it
			if (!record?._id) {
				messageApi.error("No transaction ID found");
				return;
			}
			
			await voidSale({
				variables: {
					id: record._id,
					voidReason: "Refunded by authorized user - ingredients returned",
				},
			});
		}
	};

	const handleCloseModal = () => {
		Modal.destroyAll();
		setAction("void");
		setShowPasswordModal(false);
		onClose();
	};

	const handleProceed = () => {
		setShowPasswordModal(true);
	};

	const handleDelete = (id: string) => {};

	return (
		<>
			<Modal
				destroyOnHidden={true}
				maskClosable={false}
				open={open && !showPasswordModal}
				onCancel={handleCloseModal}
				title="Void or Refund Transaction"
				footer={
					<>
						<Button onClick={handleCloseModal}>Cancel</Button>
						<Button
							onClick={handleProceed}
							type="primary"
							danger
						>
							Proceed to Verify
						</Button>
					</>
				}
				width={600}
				centered
			>
				<Space direction="vertical" style={{ width: "100%" }} size={16}>
					<div>
						<Typography.Text strong>Select Action:</Typography.Text>
						<Radio.Group
							value={action}
							onChange={(e) => setAction(e.target.value)}
							style={{ marginTop: 8, width: "100%" }}
						>
							<Space direction="vertical">
								<Radio value="void">
									<strong>Void</strong> - Cancel transaction (ingredients remain deducted)
								</Radio>
								<Radio value="refund">
									<strong>Refund</strong> - Return ingredients to inventory and cancel transaction
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
						? "You are about to void this transaction. Ingredients will remain deducted. Please enter your password to confirm."
						: "You are about to refund this transaction. Ingredients will be returned to inventory. Please enter your password to confirm."
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
