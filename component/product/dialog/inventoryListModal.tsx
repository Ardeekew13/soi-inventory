import { Button, Modal } from "antd";

interface InventoryListProps {
	open: boolean;
	onClose: () => void;
}

const InventoryListModal = (props: InventoryListProps) => {
	const { open, onClose } = props;

	const handleCloseModal = () => {
		Modal.destroyAll();
		onClose();
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={
				<>
					<Button onClick={() => handleCloseModal()}>Cancel</Button>
					<Button type="primary" form="addItem" htmlType="submit">
						Add
					</Button>
				</>
			}
		></Modal>
	);
};

export default InventoryListModal;
