import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Cart } from "@/utils/carts";
import { generateKitchenDocketHTML } from "@/utils/sendtoKitchen";

import { Button, Modal, Typography } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import dayjs from "dayjs";

interface IProps {
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
	serviceType: string | null;
}

const ReceiptDialog = (props: IProps) => {
	const {
		open,
		onClose,
		cart,
		totalAmount,
		messageApi,
		refetch,
		isParked,
		cashDrawerId,
		selectedTableNo,
		onSuccess,
		id,
		serviceType,
	} = props;

	const { setTriggerRefetch } = useRefetchFlag();
	// const [recordSale, { loading: saleLoading }] = useMutation(RECORD_SALE);
	// const [markItemsPrinted, { loading: markPrintedLoading }] =
	// 	useMutation(MARK_ITEMS_PRINTED);

	/* const handlePrint = async () => {
		try {
			const response = await recordSale({
				variables: {
					items: cart.map((item) => ({
						productId: item?.id,
						quantity: item.quantity,
					})),
					isParked,
					cashDrawerId,
					tableNo: selectedTableNo,
				},
			});

			const sale = response?.data?.recordSale;
			if (!sale?.id) {
				messageApi.error("Sale was recorded but no transaction ID returned.");
				return;
			}

			const receiptDate = dayjs(sale.createdAt).format("MMMM D, YYYY h:mm A");
			const orderNumber = sale.orderNo;

			const printWindow = window.open("", "_blank");
			if (printWindow) {
				printWindow.document.write(
					generateReceiptHTML(cart, totalAmount, receiptDate, orderNumber)
				);
				printWindow.document.close();
				printWindow.print();
				messageApi.success("Order placed and receipt printed.");
			} else {
				messageApi.error("Unable to open print window. Please allow pop-ups.");
			}
			onClose();
			setTriggerRefetch(true);
			refetch();
			onSuccess();
		} catch (error: any) {
			messageApi.error(error.message || "Failed to place order.");
		}
	}; */
	console.log("serviceType", serviceType);
	/* const handleSendToKitchen = async () => {
		try {
			const response = await recordSale({
				variables: {
					items: cart.map((item) => ({
						productId: item.id,
						quantity: item.quantity,
					})),
					isParked,
					cashDrawerId,
					selectedTableNo,
				},
			});

			const sale = response?.data?.recordSale;
			if (!sale?.id) {
				messageApi.error("Sale was recorded but no transaction ID returned.");
				return;
			}

			const orderNumber = sale.orderNo;
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
				messageApi.error("Unable to open print window. Please allow pop-ups.");
			}

			await markItemsPrinted({
				variables: { id: sale.id },
			});

			messageApi.success("Order recorded and sent to kitchen ");
			onClose();
			setTriggerRefetch(true);
			refetch();
			onSuccess();
		} catch (error: any) {
			messageApi.error(error.message || "Failed to send to kitchen.");
		}
	}; */

	const recordSaleOnly = async () => {
		// const itemsToRecord = cart?.saleItems
		// 	?.filter((item) => item.printed === false)
		// 	.map((i) => ({ productId: i.productId, quantity: i.quantity }));
		// const response = await recordSale({
		// 	variables: {
		// 		items: itemsToRecord,
		// 		id: id || undefined,
		// 		isParked,
		// 		cashDrawerId,
		// 		tableNo: selectedTableNo,
		// 		serviceType: serviceType,
		// 	},
		// });
		// const sale = response?.data?.recordSale;
		// if (!sale?.id) {
		// 	throw new Error("Sale was recorded but no transaction ID returned.");
		// }
		// messageApi.success("Order recorded successfully");
		// setTriggerRefetch(true);
		// return sale;
	};

	const printKitchenDocket = (sale: any) => {
		const orderNumber = sale.orderNo;
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
		// try {
		// 	const sale = await recordSaleOnly();
		// 	printKitchenDocket(sale);
		// 	await markItemsPrinted({
		// 		variables: { id: sale.id },
		// 	});
		// 	messageApi.success("Order placed and sent to kitchen.");
		// 	onClose();
		// 	setTriggerRefetch(true);
		// 	refetch();
		// 	onSuccess?.();
		// } catch (error: any) {
		// 	messageApi.error(error.message || "Failed to send to kitchen.");
		// }
	};
	console.log("receipt");
	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
			title={<Typography.Title level={4}>Receipt</Typography.Title>}
			footer={
				<>
					<Button>Confirm</Button>
					<Button type="primary" onClick={handleSendToKitchen}>
						Confirm & Send to Kitchen
					</Button>
				</>
			}
		>
			<div style={{ fontFamily: "monospace", lineHeight: 1.8 }}>
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
			</div>
		</Modal>
	);
};

export default ReceiptDialog;
