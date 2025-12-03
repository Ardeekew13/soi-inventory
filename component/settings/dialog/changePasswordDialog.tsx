"use client";
import { Modal, Form, Input, App } from "antd";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_MUTATION } from "@/graphql/settings/users";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

const ChangePasswordDialog = ({ open, onClose, onSuccess, user }: ChangePasswordDialogProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [updateUser, { loading }] = useMutation(UPDATE_USER_MUTATION);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.newPassword !== values.confirmPassword) {
        message.error("Passwords do not match");
        return;
      }

      const result = await updateUser({
        variables: {
          id: user._id,
          password: values.newPassword,
        },
      });

      if (result.data?.updateUser?.success) {
        message.success("Password changed successfully");
        form.resetFields();
        onSuccess();
      } else {
        message.error(result.data?.updateUser?.message || "Failed to change password");
      }
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Failed to change password");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={`Change Password - ${user?.username}`}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Change Password"
      width={500}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          rules={[
            { required: true, message: "Please confirm password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordDialog;
