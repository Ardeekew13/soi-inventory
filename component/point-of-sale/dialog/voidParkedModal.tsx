import { Alert, message, Modal, Space, Typography } from "antd";
import { useMutation } from "@apollo/client";
import { Mutation } from "@/generated/graphql";
import { VERIFY_PASSWORD } from "@/graphql/login/login";
import { DELETE_PARKED_SALE } from "@/graphql/inventory/point-of-sale";
import { useState } from "react";
import PasswordConfirmation from "@/component/common/PasswordConfirmation";

interface VoidParkedModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
  orderNo: string | null;
  onVoidSuccess: () => void;
}

const VoidParkedModal = ({
  open,
  onClose,
  saleId,
  orderNo,
  onVoidSuccess,
}: VoidParkedModalProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [voidSale, { loading: voidLoading }] = useMutation(
    DELETE_PARKED_SALE,
    {
      onCompleted: (data) => {
        if (data?.deleteParkedSale?.success) {
          messageApi.success("Parked order voided successfully");
          handleClose();
          onVoidSuccess();
        } else {
          messageApi.error(
            data?.deleteParkedSale?.message || "Failed to void order"
          );
        }
      },
      onError: (error) => {
        messageApi.error(error.message);
      },
    }
  );

  const handlePasswordVerified = async () => {
    // Void the parked sale
    if (saleId) {
      await voidSale({
        variables: { id: saleId },
      });
    }
  };

  const handleClose = () => {
    setShowPasswordModal(false);
    onClose();
  };

  const handleProceed = () => {
    setShowPasswordModal(true);
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            Void Parked Order
          </Typography.Title>
        }
        open={open && !showPasswordModal}
        onCancel={handleClose}
        onOk={handleProceed}
        okText="Proceed to Verify"
        okButtonProps={{
          danger: true,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          <Alert
            message="Void Parked Order"
            description={`You are about to void parked order ${orderNo}. Please ask your manager for approval.`}
            type="warning"
            showIcon
          />
        </Space>
      </Modal>

      <PasswordConfirmation
        open={showPasswordModal}
        title="Void Parked Order"
        description={`You are about to void parked order ${orderNo}. Ingredients will remain deducted. Please enter your password to confirm.`}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordVerified}
        messageApi={messageApi}
        confirmButtonText="Void"
      />
    </>
  );
};

export default VoidParkedModal;
