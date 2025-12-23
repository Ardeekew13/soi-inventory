import { Mutation, Sale } from "@/generated/graphql";
import {
  VOID_TRANSACTION,
  REFUND_SALE,
} from "@/graphql/inventory/transactions";
import { useMutation } from "@apollo/client";
import { Button, Modal, Radio, Space, Typography, Alert } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState, useEffect, useRef } from "react";
import PasswordConfirmation from "@/component/common/PasswordConfirmation";

interface ProductModalProps {
  open: boolean;
  record: Sale;
  onClose: () => void;
  refetch: () => void;
  messageApi: MessageInstance;
}

const VoidTransactionModal = (props: ProductModalProps) => {
  const { open, onClose, refetch, messageApi, record } = props;
  const [action, setAction] = useState<"void" | "refund">("refund");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const messageShownRef = useRef(false);
  const processingRef = useRef(false);

  // Reset message flag when modal opens
  useEffect(() => {
    if (open) {
      messageShownRef.current = false;
      processingRef.current = false;
    }
  }, [open]);

  const [voidSale, { loading: voidLoading }] = useMutation<Mutation>(
    VOID_TRANSACTION,
    {
      // Refetch queries to update transactions list
      refetchQueries: ["GET_SALES"],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        if (messageShownRef.current) return; // Prevent duplicate messages
        messageShownRef.current = true;

        if (data?.voidSale?.success) {
          messageApi.success(data?.voidSale?.message);
          refetch();
          handleCloseModal();
        } else {
          messageApi.error(data?.voidSale?.message || "Something went wrong");
          processingRef.current = false;
        }
      },
      onError: (error) => {
        if (messageShownRef.current) return; // Prevent duplicate messages
        messageShownRef.current = true;
        processingRef.current = false;
        messageApi.error("Failed to void transaction");
        console.error("Void error:", error);
      },
    }
  );

  const [refundSale, { loading: refundLoading }] = useMutation<Mutation>(
    REFUND_SALE,
    {
      // Refetch queries to update transactions list
      refetchQueries: ["GET_SALES"],
      awaitRefetchQueries: true,
      onCompleted: (data) => {
        if (messageShownRef.current) return; // Prevent duplicate messages
        messageShownRef.current = true;

        if (data?.refundSale?.success) {
          messageApi.success(data?.refundSale?.message);
          refetch();
          handleCloseModal();
        } else {
          messageApi.error(data?.refundSale?.message || "Something went wrong");
          processingRef.current = false;
        }
      },
      onError: (error) => {
        if (messageShownRef.current) return; // Prevent duplicate messages
        messageShownRef.current = true;
        processingRef.current = false;
        messageApi.error("Failed to refund transaction");
        console.error("Refund error:", error);
      },
    }
  );

  const handlePasswordVerified = async () => {
    if (!record?._id) {
      messageApi.error("No transaction ID found");
      return;
    }

    // Prevent duplicate execution
    if (processingRef.current) {
      console.log("Already processing, skipping duplicate call");
      return;
    }
    processingRef.current = true;

    try {
      if (action === "void") {
        // Void the transaction - returns inventory and updates cash drawer
        await voidSale({
          variables: {
            id: record._id,
            voidReason: "Voided by authorized user",
          },
        });
      } else if (action === "refund") {
        // Refund - returns ingredients to inventory (ONLY for COMPLETED sales)
        if (record.status !== "COMPLETED") {
          messageApi.error("Can only refund completed sales");
          processingRef.current = false;
          return;
        }

        await refundSale({
          variables: {
            id: record._id,
            refundReason: "Refunded by authorized user",
          },
        });
      }
    } catch (error) {
      console.error("Error in handlePasswordVerified:", error);
      processingRef.current = false;
    }
  };

  const handleCloseModal = () => {
    Modal.destroyAll();
    setAction("refund");
    setShowPasswordModal(false);
    onClose();
  };

  const handleProceed = () => {
    if (action === "refund" && record.status !== "COMPLETED") {
      messageApi.error("Can only refund completed sales");
      return;
    }
    setShowPasswordModal(true);
  };

  const isCompleted = record?.status === "COMPLETED";

  return (
    <>
      <Modal
        destroyOnHidden={true}
        maskClosable={false}
        open={open && !showPasswordModal}
        onCancel={handleCloseModal}
        title={isCompleted ? "Refund or Void Transaction" : "Void Transaction"}
        footer={
          <>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleProceed}
              type="primary"
              danger
              loading={voidLoading || refundLoading}
            >
              Proceed to Verify
            </Button>
          </>
        }
        width={600}
        centered
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {!isCompleted && (
            <Alert
              message="Parked Sale"
              description="Voiding will return ingredients to inventory. No cash drawer adjustment needed since payment hasn't been made."
              type="info"
              showIcon
            />
          )}

          {isCompleted && (
            <Alert
              message="✅ Completed Sale"
              description="Both actions will return ingredients to inventory and deduct from cash drawer. Choose based on your accounting preference."
              type="info"
              showIcon
            />
          )}

          <div>
            <Typography.Text strong>Select Action:</Typography.Text>
            <Radio.Group
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{ marginTop: 8, width: "100%" }}
            >
              <Space direction="vertical">
                {isCompleted && (
                  <Radio value="refund">
                    <strong>Refund (Recommended)</strong> - Full refund with
                    inventory return
                    <Typography.Text
                      type="secondary"
                      style={{ display: "block", marginLeft: 24 }}
                    >
                      Returns ingredients to inventory and deducts amount from
                      cash drawer. Labeled as "REFUND" in records.
                    </Typography.Text>
                  </Radio>
                )}
                <Radio value="void">
                  <strong>Void</strong> - Cancel transaction with inventory
                  return
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", marginLeft: 24 }}
                  >
                    {isCompleted
                      ? 'Returns ingredients to inventory and deducts from cash drawer. Labeled as "VOID" in records.'
                      : "Returns ingredients to inventory. No cash drawer adjustment (not yet paid)."}
                  </Typography.Text>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </Space>
      </Modal>

      <PasswordConfirmation
        open={showPasswordModal}
        title={action === "void" ? "Void Transaction" : "Refund Transaction"}
        description={
          action === "void"
            ? "You are about to void this transaction. Ingredients will be returned to inventory" +
              (isCompleted ? " and amount deducted from cash drawer" : "") +
              ". Please enter your password to confirm."
            : "You are about to refund this transaction. Ingredients will be returned to inventory and amount deducted from cash drawer. Please enter your password to confirm."
        }
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handlePasswordVerified}
        messageApi={messageApi}
        confirmButtonText={
          action === "void" ? "Verify and Void" : "Verify and Refund"
        }
      />
    </>
  );
};

export default VoidTransactionModal;
