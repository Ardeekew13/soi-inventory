"use client";
import { useDiscountList } from "@/hooks/transaction";
import { supabase } from "@/lib/supabase-client";
import { Cart } from "@/utils/carts";
import { Button, message, Modal, Select, Steps, Typography } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useMemo, useState } from "react";

interface IProps {
	saleId: string;
	open: boolean;
	onClose: () => void;
	cart: Cart;
	messageApi: MessageInstance;
	totalAmount: number;
	refetch: () => void;
	isParked: boolean;
	cashDrawerId: string;
	selectedTableNo: number | null;
	onSuccess: () => void;
	id: string;
}

interface DiscountState {
	id: string | null;
	label: string;
	percentage: number;
}

const { Step } = Steps;
const CheckoutDialog = (props: IProps) => {
	const { open, onClose, cart, totalAmount, saleId } = props;

	const [messageApi, contextHolder] = message.useMessage();
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const discountList = useDiscountList();
	const [discount, setDiscount] = useState<DiscountState | null>(null);

	// const [checkoutSale, { loading: checkoutLoading }] = useMutation<Mutation>(
	// 	CHECKOUT_SALE,
	// 	{
	// 		onCompleted: (data) => {
	// 			if (data.checkoutSale.success) {
	// 				messageApi.success(data.checkoutSale.message);
	// 				props.onSuccess();
	// 				onClose();
	// 				props.refetch();
	// 			} else {
	// 				messageApi.error(data.checkoutSale.message);
	// 			}
	// 		},
	// 	}
	// );

	const handleSelectPayment = (val: string) => {
		setPaymentMethod(val);

		setCurrentStep(1);
	};

	const handleCheckOut = async () => {
		setLoading(true);
		const { data, error } = await supabase.rpc("checkout_sale", {
			p_id: saleId,
			p_payment_method: paymentMethod,
		});
		setLoading(false);
		if (error) {
			messageApi.error(error?.message);
		} else if (data?.success) {
			messageApi.success(data?.message || "Sale checked out successfully");
			props.onSuccess();
			onClose();
			props.refetch();
		}
	};
	console.log("discount", discount);

	const steps = [
		{
			title: "Payment",
			content: (
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div>
						<Typography.Text strong>Discounts</Typography.Text>
						<Select
							placeholder="Select Discount"
							style={{ width: "100%", marginTop: 8 }}
							value={discount || undefined}
							labelInValue
							onChange={(option: any) => {
								console.log("option", option);
								setDiscount(option);
							}}
							options={discountList}
						/>
					</div>
					<div>
						<Typography.Text strong>Payment Method</Typography.Text>
						<Select
							placeholder="Select Payment Method"
							style={{ width: "100%", marginTop: 8 }}
							value={paymentMethod || undefined}
							onChange={(val) => handleSelectPayment(val)}
							options={[
								{ label: "Cash", value: "CASH" },
								{ label: "Gcash", value: "GCASH" },
								{ label: "Bank-Transfer", value: "BANK-TRANSFER" },
								{ label: "Card", value: "CARD" },
							]}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Confirmation",
			content: (
				<>
					<Typography.Text strong>Items:</Typography.Text>
					<ul style={{ paddingLeft: 20 }}>
						{cart?.saleItems.map((item) => (
							<li key={item?.tempKey}>
								{item.name} x {item.quantity} = ₱
								{(item.price * item.quantity).toLocaleString("en-PH")}
							</li>
						))}
					</ul>
					<Typography.Text strong>
						Order Total: ₱{totalAmount.toLocaleString("en-PH")}
					</Typography.Text>
				</>
			),
		},
	];
	const canNext = useMemo(() => {
		switch (currentStep) {
			case 0:
				return paymentMethod !== null;
			case 1:
				return true;
			default:
				return false;
		}
	}, [currentStep, paymentMethod]);

	const guardNext = () => {
		if (!canNext) {
			messageApi.warning("Please select a payment method");
			return;
		}
		setCurrentStep((prev) => prev + 1);
	};
	const prev = () => setCurrentStep((prev) => prev - 1);

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			footer={null}
			width={800}
			onCancel={onClose}
			title={<Typography.Title level={4}>Order Confirmation</Typography.Title>}
		>
			{contextHolder}
			<Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
				{steps.map((item) => (
					<Step key={item.title} title={item.title} />
				))}
			</Steps>
			<div>{steps[currentStep].content}</div>
			<div style={{ marginTop: 24, textAlign: "right" }}>
				{currentStep > 0 && (
					<Button onClick={prev} style={{ marginRight: 8 }}>
						Previous
					</Button>
				)}
				{currentStep < steps.length - 1 && (
					<Button type="primary" onClick={guardNext} disabled={!canNext}>
						Next
					</Button>
				)}
				{currentStep === steps.length - 1 && (
					<Button
						type="primary"
						onClick={() => handleCheckOut()}
						style={{ marginLeft: 8 }}
					>
						Checkout Order
					</Button>
				)}
			</div>
		</Modal>
	);
};

export default CheckoutDialog;
