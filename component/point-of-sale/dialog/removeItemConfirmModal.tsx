import { MessageInstance } from "antd/es/message/interface";
import PasswordConfirmation from "@/component/common/PasswordConfirmation";

interface RemoveItemConfirmModalProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
  messageApi: MessageInstance;
}

const RemoveItemConfirmModal = ({
  open,
  itemName,
  onClose,
  onConfirm,
  messageApi,
}: RemoveItemConfirmModalProps) => {
  return (
    <PasswordConfirmation
      open={open}
      title="Remove Item from Loaded Order"
      description={`You are about to remove "${itemName}" from a loaded order. This action requires password verification.`}
      onClose={onClose}
      onConfirm={onConfirm}
      messageApi={messageApi}
      confirmButtonText="Remove"
    />
  );
};

export default RemoveItemConfirmModal;
