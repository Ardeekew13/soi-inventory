import { gql, useMutation } from "@apollo/client";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import Image from "next/image";
import voidPc from "@/app/assets/voidPc.svg";

const VERIFY_PASSWORD = gql`
  mutation VerifyPassword($password: String!) {
    verifyPassword(password: $password) {
      success
      message
    }
  }
`;

interface PasswordConfirmationProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  messageApi: MessageInstance;
  confirmButtonText?: string;
}

const PasswordConfirmation = ({
  open,
  title = "Password Verification Required",
  description = "Please enter your password to confirm this action.",
  onClose,
  onConfirm,
  messageApi,
  confirmButtonText = "Verify and Confirm",
}: PasswordConfirmationProps) => {
  const [passwordForm] = Form.useForm();

  const [verifyPassword, { loading: verifyingPassword }] = useMutation(
    VERIFY_PASSWORD,
    {
      onCompleted: async (data) => {
        if (data?.verifyPassword?.success) {
          messageApi.success("Password verified");
          passwordForm.resetFields();
          onConfirm();
          onClose();
        } else {
          messageApi.error(
            data?.verifyPassword?.message || "Incorrect password"
          );
        }
      },
      onError: () => {
        messageApi.error("Password verification failed");
      },
    }
  );

  const handleCloseModal = () => {
    passwordForm.resetFields();
    onClose();
  };

  const handleVerifyPassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      await verifyPassword({
        variables: {
          password: values.password,
        },
      });
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      destroyOnHidden={true}
      maskClosable={false}
      open={open}
      onCancel={handleCloseModal}
      title={title}
      footer={
        <>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleVerifyPassword}
            type="primary"
            danger
            loading={verifyingPassword}
          >
            {confirmButtonText}
          </Button>
        </>
      }
      width={500}
      centered
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Image
          src={voidPc}
          alt="Password Verification"
          width={400}
          height={300}
          style={{ margin: "0 auto", objectFit: "contain" }}
        />
      </div>
      
      {description && (
        <p style={{ marginBottom: 16, textAlign: "center" }}>
          {description}
        </p>
      )}
      
      <Form
        form={passwordForm}
        name="passwordVerification"
        layout="vertical"
        onFinish={handleVerifyPassword}
      >
        <Row gutter={4}>
          <Col span={24}>
            <Form.Item
              label="Enter your password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password size="large" placeholder="Enter password" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PasswordConfirmation;
