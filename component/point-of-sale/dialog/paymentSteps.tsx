import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { supabase } from "@/lib/supabase-client";
import { Cart } from "@/utils/carts";
import { generateKitchenDocketHTML } from "@/utils/sendtoKitchen";
import {
	Button,
	Card,
	Col,
	message,
	Modal,
	Row,
	Steps,
	Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import OrderSummary from "../OrderSummary";

interface IProps {
	open: boolean;
	onClose: () => void;
	onConfirm?: () => void;
	setSelectedTableNo: React.Dispatch<React.SetStateAction<number | null>>;
	selectedTableNo: number | null;
	setServiceType: React.Dispatch<React.SetStateAction<string | null>>;
	serviceType: string | null;
	cart: Cart;
	id: string;
	cashDrawerId: string;
	isParked: boolean;
	refetch: () => void;
	onSuccess: () => void;
	currentStep: number;
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}
const { Step } = Steps;

const PaymentSteps = (props: IProps) => {
	const {
		open,
		onClose,
		selectedTableNo,
		setSelectedTableNo,
		onConfirm,
		serviceType,
		setServiceType,
		cart,
		id,
		isParked,
		cashDrawerId,
		refetch,
		onSuccess,
		currentStep,
		setCurrentStep,
	} = props;
	const tableNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const serviceTypeOptions = [
		{ label: "Dine-in", value: "DINE_IN" },
		{ label: "Take-out", value: "TAKE_OUT" },
	];
	const [messageApi, contextHolder] = message.useMessage();
	const [draftServiceType, setDraftServiceType] = useState<string | null>(
		serviceType ?? null
	);
	const [draftTableNo, setDraftTableNo] = useState<number | null>(
		selectedTableNo ?? null
	);

	const { setTriggerRefetch } = useRefetchFlag();

	const handleSelectTable = (num: number) => {
		setDraftTableNo(num);
	};

	const handleSelectService = (type: string) => {
		console.log("type", type);
		setDraftServiceType(type);
	};

	const totalAmount = cart?.saleItems.reduce((acc, item) => {
		if (item.fromDb === false) {
			return acc + item.price * item.quantity;
		}
		return acc;
	}, 0);

	const canNext = useMemo(() => {
		switch (currentStep) {
			case 0: // need service type
				return !!draftServiceType;
			case 1: // need table if dine-in
				return draftServiceType === "TAKE_OUT" || draftTableNo !== null;
			case 2: // confirm step new items
				return cart?.saleItems.some((i) => !i.fromDb);
			default:
				return true;
		}
	}, [currentStep, draftServiceType, draftTableNo, cart]);

	useEffect(() => {
		if (!open) return;
		setDraftServiceType(serviceType ?? null);
		setDraftTableNo(selectedTableNo ?? null);

		const hasService = !!serviceType;
		const hasTable =
			serviceType === "DINE_IN" ? selectedTableNo !== null : true;

		if (hasService && hasTable) {
			// reorder case: jump to Confirm Order
			setCurrentStep(2);
		} else if (hasService && hasTable) {
			// just need payment
			setCurrentStep(3);
		} else if (hasService) {
			// need table (for dine-in)
			setCurrentStep(1);
		} else {
			// start from the beginning
			setCurrentStep(0);
		}
	}, [open, serviceType, selectedTableNo, setCurrentStep]);

	useEffect(() => {
		const hasTable = draftServiceType === "DINE_IN" ? !!selectedTableNo : true;

		if (draftServiceType && hasTable) {
			setCurrentStep(2);
		}
	}, [draftServiceType, selectedTableNo]);

	const guardNext = () => {
		if (!canNext) {
			const msg =
				currentStep === 0
					? "Please choose Dine-In or Take-Out."
					: currentStep === 1
					? "Please select a table number."
					: "Your cart has no new items to pay for.";
			messageApi.warning(msg);
			return;
		}

		if (currentStep === 0) {
			setServiceType(draftServiceType);
		} else if (currentStep === 1) {
			setSelectedTableNo(draftTableNo);
		}
		setCurrentStep((prev) => prev + 1);
	};

	const recordSaleOnly = async () => {
		console.log("cart", cart);

		// only send items that have unprinted qty
		const itemsToRecord = cart.saleItems
			?.filter((item) => (item.quantity ?? 0) > (item.printed_qty ?? 0))
			.map((i) => ({
				productId: i.productId,
				quantity: (i.quantity ?? 0) - (i.printed_qty ?? 0), // send only the NEW qty
				price: i.price,
			}));

		const { data: saleRes, error } = await supabase.rpc("record_sale", {
			p_id: id,
			p_table_no: selectedTableNo,
			p_cash_drawer_id: cashDrawerId,
			p_service_type: serviceType,
			p_items: itemsToRecord,
		});

		if (error) {
			messageApi.error(error.message || "Error recording sale");
			throw error;
		}

		if (!saleRes?.sale_id) {
			throw new Error("Sale was recorded but no transaction ID returned.");
		}

		messageApi.success("Order recorded successfully");
		setTriggerRefetch(true);
		refetch();

		return { id: saleRes.sale_id };
	};

	const printKitchenDocket = (sale: any) => {
		console.log("sale print", sale);
		const orderNumber = sale.order_no;
		const printedAt = dayjs(sale.createdAt).format("MMMM D, YYYY h:mm A");

		const kitchenHTML = generateKitchenDocketHTML(
			cart,
			selectedTableNo,
			orderNumber,
			printedAt
		);

		const printWindow = window.open("", "_blank");
		if (printWindow) {
			printWindow.document.write(kitchenHTML);
			printWindow.document.close();
			printWindow.print();
		} else {
			throw new Error("Unable to open print window. Please allow pop-ups.");
		}
	};

	const handleSendToKitchen = async () => {
		let isMounted = true;

		try {
			// 1. Record sale
			const sale = await recordSaleOnly();
			console.log("sale to kitchen", sale);

			// 2. Print kitchen docket for new items
			printKitchenDocket(sale);

			// 3. Mark items as printed
			console.log("Calling mark_items_printed with:", sale.id);
			const { data, error } = await supabase.rpc("mark_items_printed", {
				p_sale_id: sale.id,
			});

			if (error) {
				if (isMounted) messageApi.error(error.message);
			} else {
				const unprintedItems = data.unprinted_items;
				if (isMounted && unprintedItems?.length > 0) {
					printKitchenDocket(unprintedItems);
				}
			}

			// 4. Success feedback
			if (isMounted) {
				messageApi.success("Order placed and sent to kitchen.");
				setTriggerRefetch(true);
				refetch();
				onSuccess?.();
			}

			// 5. Close modal LAST
			if (isMounted) {
				onClose();
			}
		} catch (err: any) {
			if (isMounted) {
				messageApi.error(err.message || "Failed to send to kitchen.");
			}
		}

		// Cleanup guard
		return () => {
			isMounted = false;
		};
	};

	const steps = [
		{
			title: "Order Type",
			content: (
				<Row gutter={[16, 16]}>
					{serviceTypeOptions.map((type) => (
						<Col span={12} key={type.value}>
							<Card
								style={{
									textAlign: "center",
									border: "1px solid #1e3a8a",
									color: draftServiceType === type.value ? "white" : "black",
									backgroundColor:
										draftServiceType === type.value ? "#153794ff" : "",
								}}
								onClick={() => handleSelectService(type.value)}
							>
								{type.label}
							</Card>
						</Col>
					))}
				</Row>
			),
		},
		{
			title: "Table Number",
			content:
				serviceType === "DINE_IN" ? (
					<Row gutter={[16, 16]}>
						{tableNumber.map((num) => (
							<Col span={8} key={num}>
								<Card
									style={{
										textAlign: "center",
										border: "1px solid #1e3a8a",
										color: draftTableNo === num ? "white" : "black",
										backgroundColor: draftTableNo === num ? "#153794ff" : "",
									}}
									onClick={() => handleSelectTable(num)}
								>
									Table {num}
								</Card>
							</Col>
						))}
					</Row>
				) : (
					<p>No table needed for Take-Out</p>
				),
		},

		/* {
			title: "Payment",
			content: (
				<>
					<Select
						placeholder="Select Payment Method"
						style={{ width: "100%" }}
						value={paymentMethod || undefined}
						onChange={(val) => handleSelectPayment(val)}
						options={[
							{ label: "Cash", value: "CASH" },
							{ label: "Gcash", value: "GCASH" },
							{ label: "Bank-Transfer", value: "BANK-TRANSFER" },
							{ label: "Card", value: "CARD" },
						]}
					/>
				</>
			),
		}, */
		{
			title: "Confirm Order",
			content: (
				<OrderSummary
					cart={cart}
					totalAmount={totalAmount}
					serviceType={draftServiceType}
					tableNo={draftTableNo}
				/>
			),
		},
	];

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
					<Button type="default" onClick={() => handleSendToKitchen()}>
						Confirm
					</Button>
				)}
				{currentStep === steps.length - 1 && (
					<Button
						type="primary"
						onClick={() => handleSendToKitchen()}
						style={{ marginLeft: 8 }}
					>
						Confirm & Send To Kitchen
					</Button>
				)}
			</div>
		</Modal>
	);
};

export default PaymentSteps;
