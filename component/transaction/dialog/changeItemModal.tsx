import { Mutation, Product, Query, Sale, SaleItem } from "@/generated/graphql";
import { CHANGE_ITEM } from "@/graphql/inventory/transactions";
import { GET_PRODUCTS } from "@/graphql/inventory/products";
import { useMutation, useQuery } from "@apollo/client";
import { Button, Modal, Select, InputNumber, Input, Space, Typography, Alert, Card, Divider } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import PasswordConfirmation from "@/component/common/PasswordConfirmation";
import { pesoFormatter } from "@/utils/helper";

interface ChangeItemModalProps {
	open: boolean;
	record: Sale;
	onClose: () => void;
	refetch: () => void;
	messageApi: MessageInstance;
}

const ChangeItemModal = (props: ChangeItemModalProps) => {
	const { open, onClose, refetch, messageApi, record } = props;
	const [selectedOldItemId, setSelectedOldItemId] = useState<string | null>(null);
	const [selectedNewProductId, setSelectedNewProductId] = useState<string | null>(null);
	const [newQuantity, setNewQuantity] = useState<number>(1);
	const [reason, setReason] = useState<string>("");
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const { data: productsData } = useQuery<Query>(GET_PRODUCTS, {
		variables: { search: "", limit: 1000 },
	});

	const [changeItem, { loading }] = useMutation<Mutation>(CHANGE_ITEM, {
		onCompleted: (data) => {
			if (data?.changeItem?.success) {
				messageApi.success(data?.changeItem?.message);
				refetch();
				handleCloseModal();
			} else {
				messageApi.error(data?.changeItem?.message || "Something went wrong");
			}
		},
		onError: (error) => {
			messageApi.error("Failed to change item");
			console.error("Change item error:", error);
		},
	});

	const handlePasswordVerified = async () => {
		if (!record?._id || !selectedOldItemId || !selectedNewProductId || !reason) {
			messageApi.error("Please fill in all required fields");
			return;
		}

		if (newQuantity <= 0) {
			messageApi.error("Quantity must be greater than 0");
			return;
		}

		await changeItem({
			variables: {
				saleId: record._id,
				oldSaleItemId: selectedOldItemId,
				newProductId: selectedNewProductId,
				newQuantity,
				reason,
			},
		});
	};

	const handleCloseModal = () => {
		Modal.destroyAll();
		setSelectedOldItemId(null);
		setSelectedNewProductId(null);
		setNewQuantity(1);
		setReason("");
		setShowPasswordModal(false);
		onClose();
	};

	const handleProceed = () => {
		if (!selectedOldItemId) {
			messageApi.error("Please select the item to change");
			return;
		}
		if (!selectedNewProductId) {
			messageApi.error("Please select the new product");
			return;
		}
		if (!reason.trim()) {
			messageApi.error("Please provide a reason for changing the item");
			return;
		}
		setShowPasswordModal(true);
	};

	const products = productsData?.productsList?.products || [];
	const saleItems = record?.saleItems || [];
	const selectedOldItem = saleItems.find((item) => item._id === selectedOldItemId);
	const selectedNewProduct = products.find((p) => p._id === selectedNewProductId);

	const isCompleted = record?.status === "COMPLETED";

	return (
		<>
			<Modal
				destroyOnHidden={true}
				maskClosable={false}
				open={open && !showPasswordModal}
				onCancel={handleCloseModal}
				title="Change Item in Transaction"
				footer={
					<>
						<Button onClick={handleCloseModal}>Cancel</Button>
						<Button
							onClick={handleProceed}
							type="primary"
							loading={loading}
							disabled={!selectedOldItemId || !selectedNewProductId || !reason.trim()}
						>
							Proceed to Verify
						</Button>
					</>
				}
				width={700}
				centered
			>
				<Space direction="vertical" style={{ width: "100%" }} size={16}>
					{!isCompleted && (
						<Alert
							message="Can only change items in completed sales"
							description="This transaction must be completed before you can change items."
							type="error"
							showIcon
						/>
					)}

					{isCompleted && (
						<Alert
							message="⚠️ Important: Inventory will be updated"
							description="Changing an item will return the old product's ingredients to inventory and deduct the new product's ingredients."
							type="warning"
							showIcon
						/>
					)}

					<div>
						<Typography.Text strong>1. Select item to change:</Typography.Text>
						<Select
							style={{ width: "100%", marginTop: 8 }}
							placeholder="Select item from this sale"
							value={selectedOldItemId}
							onChange={(value) => {
								setSelectedOldItemId(value);
								const item = saleItems.find((i) => i._id === value);
								if (item) {
									setNewQuantity(item.quantity);
								}
							}}
							disabled={!isCompleted}
						>
							{saleItems.map((item: any) => (
								<Select.Option key={item._id} value={item._id}>
									{item.product?.name} - Qty: {item.quantity} - {pesoFormatter(item.priceAtSale * item.quantity)}
								</Select.Option>
							))}
						</Select>
					</div>

					<div>
						<Typography.Text strong>2. Select new product:</Typography.Text>
						<Select
							style={{ width: "100%", marginTop: 8 }}
							placeholder="Select new product"
							value={selectedNewProductId}
							onChange={(value) => setSelectedNewProductId(value)}
							showSearch
							filterOption={(input, option) =>
								(option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
							}
							disabled={!isCompleted || !selectedOldItemId}
						>
							{products.map((product: any) => (
								<Select.Option key={product._id} value={product._id}>
									{product.name} - {pesoFormatter(product.price)}
								</Select.Option>
							))}
						</Select>
					</div>

					<div>
						<Typography.Text strong>3. New quantity:</Typography.Text>
						<InputNumber
							style={{ width: "100%", marginTop: 8 }}
							min={1}
							value={newQuantity}
							onChange={(value) => setNewQuantity(value || 1)}
							disabled={!isCompleted || !selectedOldItemId}
						/>
					</div>

					<div>
						<Typography.Text strong>4. Reason for change:</Typography.Text>
						<Input.TextArea
							style={{ marginTop: 8 }}
							placeholder="e.g., Customer requested different item, Wrong order, etc."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={3}
							disabled={!isCompleted}
							maxLength={200}
						/>
					</div>

					{selectedOldItem && selectedNewProduct && (
						<>
							<Divider style={{ margin: "8px 0" }} />
							<Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
								<Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
									Summary of Changes:
								</Typography.Text>
								<Space direction="vertical" size={4} style={{ width: "100%" }}>
									<Typography.Text type="danger">
										❌ Removing: {selectedOldItem.product?.name} (Qty: {selectedOldItem.quantity})
									</Typography.Text>
									<Typography.Text type="success">
										✅ Adding: {selectedNewProduct.name} (Qty: {newQuantity})
									</Typography.Text>
									<Divider style={{ margin: "8px 0" }} />
									<Typography.Text>
										Price difference: {pesoFormatter((selectedNewProduct.price * newQuantity) - (selectedOldItem.priceAtSale * selectedOldItem.quantity))}
									</Typography.Text>
								</Space>
							</Card>
						</>
					)}
				</Space>
			</Modal>

			<PasswordConfirmation
				open={showPasswordModal}
				title="Change Item"
				description={`You are about to change ${selectedOldItem?.product?.name} to ${selectedNewProduct?.name}. This will update inventory and sale totals. Please enter your password to confirm.`}
				onClose={() => setShowPasswordModal(false)}
				onConfirm={handlePasswordVerified}
				messageApi={messageApi}
				confirmButtonText="Verify and Change Item"
			/>
		</>
	);
};

export default ChangeItemModal;
