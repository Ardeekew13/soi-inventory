import Void from "@/public/void.png";
import { Modal } from "antd";
import Image from "next/image";

interface IPopupVoidModalProps {
	open: boolean;
	onClose: () => void;
	refetch: () => void;
}

const PopupVoidModal = (props: IPopupVoidModalProps) => {
	const { open, onClose, refetch } = props;
	return (
		<Modal open={open} onCancel={onClose}>
			<Image src={Void} alt="void" />
		</Modal>
	);
};

export default PopupVoidModal;
