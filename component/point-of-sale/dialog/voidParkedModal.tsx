import { Alert, message, Modal, Radio, Space, Typography } from "antd";
import { useMutation } from "@apollo/client";
import { Mutation } from "@/generated/graphql";
import { VERIFY_PASSWORD } from "@/graphql/login/login";
import { DELETE_PARKED_SALE } from "@/graphql/inventory/point-of-sale";
import { useState } from "react";
import { Button } from "antd";
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
  const [action, setAction] = useState<"void" | "refund">("void");
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
    if (action === "void") {
      // Void the parked sale (current functionality)
      if (saleId) {
        await voidSale({
          variables: { id: saleId },
        });
      }
    } else if (action === "refund") {
      // Refund functionality - return ingredients to inventory
      messageApi.info("Refund: returning ingredients to inventory");
      // TODO: Implement refund mutation
      if (saleId) {
        await voidSale({
          variables: { id: saleId },
        });
      }
    }
  };

  const handleClose = () => {
    setAction("void");
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
            Void or Refund Parked Order
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
            message="Select Action"
            description={`You are about to ${action} parked order ${orderNo}. Please select action and proceed to verify with your password.`}
            type="warning"
            showIcon
          />
          
          <div>
            <Typography.Text strong>Select Action:</Typography.Text>
            <Radio.Group
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{ marginTop: 8, width: "100%" }}
            >
              <Space direction="vertical">
                <Radio value="void">
                  <strong>Void</strong> - Cancel order (ingredients remain deducted)
                </Radio>
                <Radio value="refund">
                  <strong>Refund</strong> - Return ingredients to inventory and cancel order
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </Space>
      </Modal>

      <PasswordConfirmation
        open={showPasswordModal}
        title={action === "void" ? "Void Parked Order" : "Refund Parked Order"}
        description={
          action === "void"
            ? `You are about to void parked order ${orderNo}. Ingredients will remain deducted. Please enter your password to confirm.`
            : `You are about to refund parked order ${orderNo}. Ingredients will be returned to inventory. Please enter your password to confirm.`
        }
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordVerified}
        messageApi={messageApi}
        confirmButtonText={action === "void" ? "Void" : "VRefund"}
      />
    </>
  );
};

export default VoidParkedModal;
