import { RECORD_SALE } from "@/graphql/inventory/point-of-sale";
import { CartProduct } from "@/utils/helper";
import { generateReceiptHTML } from "@/utils/receiptPage";
import { useMutation } from "@apollo/client";
import { Button, Modal, Typography } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import dayjs from "dayjs";

interface IProps {
	open: boolean;
	onClose: () => void;
	cart: CartProduct[];
	messageApi: MessageInstance;
	totalAmount: number;
	setCart: React.Dispatch<React.SetStateAction<CartProduct[]>>;
}

const ReceiptDialog = (props: IProps) => {
	const { open, onClose, cart, totalAmount, messageApi, setCart } = props;

	const [recordSale, { loading: saleLoading }] = useMutation(RECORD_SALE);

	const handlePrint = async () => {
		try {
			const response = await recordSale({
				variables: {
					items: cart.map((item) => ({
						productId: item.id,
						quantity: item.quantity,
					})),
				},
			});

			const sale = response?.data?.recordSale;
			if (!sale?.id) {
				messageApi.error("Sale was recorded but no transaction ID returned.");
				return;
			}

			const receiptDate = dayjs(sale.createdAt).format("MMMM D, YYYY h:mm A");
			const orderNumber = sale.id;

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
			setCart([]);
		} catch (error: any) {
			messageApi.error(error.message || "Failed to place order.");
		}
	};

	return (
		<Modal
			destroyOnHidden={true}
			maskClosable={false}
			open={open}
			onCancel={onClose}
			title={<Typography.Title level={4}>Receipt</Typography.Title>}
			footer={
				<>
					<Button onClick={() => onClose()}>Cancel</Button>
					<Button type="primary" onClick={handlePrint}>
						Confirm & Print
					</Button>
				</>
			}
		>
			<div style={{ fontFamily: "monospace", lineHeight: 1.8 }}>
				<Typography.Text strong>Items:</Typography.Text>
				<ul style={{ paddingLeft: 20 }}>
					{cart.map((item) => (
						<li key={item.id}>
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
