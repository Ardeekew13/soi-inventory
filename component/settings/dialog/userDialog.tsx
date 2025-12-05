"use client";
import { Modal, Form, Input, Select, Switch, App, Tabs, Checkbox, Divider, Collapse, Row, Col, Typography } from "antd";
import { useMutation, useApolloClient, useQuery } from "@apollo/client";
import {
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/graphql/settings/users";
import { ME_QUERY } from "@/graphql/auth/me";
import { SHIFT_SCHEDULES_QUERY } from "@/graphql/shift/shiftSchedule";
import React, { useEffect } from "react";
import { PERMISSION_MODULES, getFullPermissions } from "@/utils/permissions";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // If user exists, it's edit mode. If null/undefined, it's add mode
  currentUserId?: string; // ID of the currently logged-in user
  canManagePermissions?: boolean; // Can this user manage permissions?
}

const UserDialog = ({ open, onClose, onSuccess, user, currentUserId, canManagePermissions = false }: UserDialogProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const apolloClient = useApolloClient();
  const isEditMode = !!user;
  const isEditingSelf = user?._id === currentUserId;

  // Fetch shift schedules
  const { data: shiftSchedulesData } = useQuery(SHIFT_SCHEDULES_QUERY);
  const shiftSchedules = shiftSchedulesData?.shiftSchedules || [];

  // Get default schedule ID
  const defaultScheduleId = React.useMemo(() => {
    const defaultSchedule = shiftSchedules.find((s: any) => s.isDefault);
    return defaultSchedule?._id || null;
  }, [shiftSchedules]);

  const [createUser, { loading: createLoading }] =
    useMutation(CREATE_USER_MUTATION);
  const [updateUser, { loading: updateLoading }] =
    useMutation(UPDATE_USER_MUTATION);

  const loading = createLoading || updateLoading;

  useEffect(() => {
    if (user && open) {
      // Populate form with existing user data for edit mode
      const permissions = user.role === 'SUPER_ADMIN' ? getFullPermissions() : (user.permissions || {});
      form.setFieldsValue({
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        permissions: permissions,
        shiftScheduleId: user.shiftScheduleId || null,
      });
    } else if (open) {
      // Reset form for add mode - set default shift schedule
      form.resetFields();
      // Set default schedule if available
      if (defaultScheduleId) {
        form.setFieldsValue({
          shiftScheduleId: defaultScheduleId,
        });
      }
    }
  }, [user, open, form, defaultScheduleId]);

  // Handle role changes - give SUPER_ADMIN full access
  // Only run this when the modal is open
  const handleRoleChange = (value: string) => {
    if (value === 'SUPER_ADMIN') {
      // Give SUPER_ADMIN all permissions
      form.setFieldsValue({
        permissions: getFullPermissions(),
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        // Update existing user
        const variables: any = {
          id: user._id,
          username: values.username,
          role: values.role,
          isActive: values.isActive,
          firstName: values.firstName,
          lastName: values.lastName,
          permissions: values.permissions || {},
          shiftScheduleId: values.shiftScheduleId || null,
        };
        if (values.password) {
          variables.password = values.password;
        }
        const result = await updateUser({ variables });
        if (result.data?.updateUser?.success) {
          message.success("User updated successfully");
          
          // If updating the current logged-in user, refetch ME_QUERY to update navbar
          if (currentUserId && user._id === currentUserId) {
            await apolloClient.refetchQueries({
              include: [ME_QUERY],
            });
          }
          
          form.resetFields();
          onSuccess();
        } else {
          message.error(result.data?.updateUser?.message || "Failed to update user");
        }
      } else {
        // Create new user
        const result = await createUser({
          variables: {
            username: values.username,
            password: values.password,
            role: values.role,
            firstName: values.firstName,
            lastName: values.lastName,
            permissions: values.permissions || {},
            shiftScheduleId: values.shiftScheduleId || null,
          },
        });
        if (result.data?.createUser?.success) {
          message.success("User created successfully");
          form.resetFields();
          onSuccess();
        } else {
          message.error(result.data?.createUser?.message || "Failed to create user");
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error(
        error.message || `Failed to ${isEditMode ? "update" : "create"} user`
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const [activeTab, setActiveTab] = React.useState("1");
  return (
    <Modal
      title={isEditMode ? "Edit User" : "Add New User"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEditMode ? "Update" : "Create"}
      width={1000}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "1",
              label: "User Info",
              children: (
                <>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                      { required: true, message: "Please enter username" },
                      { min: 3, message: "Username must be at least 3 characters" },
                    ]}
                  >
                    <Input placeholder="Enter username" disabled={isEditingSelf} />
                  </Form.Item>
                  {!isEditingSelf && (
                    <Form.Item
                      name="role"
                      label="Role"
                      rules={[{ required: true, message: "Please select a role" }]}
                    >
                      <Select placeholder="Select role" onChange={handleRoleChange}>
                        <Select.Option value="SUPER_ADMIN">Super Admin</Select.Option>
                        <Select.Option value="MANAGER">Manager</Select.Option>
                        <Select.Option value="CASHIER">Cashier</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                  {!isEditMode && (
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: true, message: "Please enter password" },
                        { min: 6, message: "Password must be at least 6 characters" },
                      ]}
                    >
                      <Input.Password placeholder="Enter password" />
                    </Form.Item>
                  )}
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: false }]}
                  >
                    <Input placeholder="Enter first name (optional)" />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: false }]}
                  >
                    <Input placeholder="Enter last name (optional)" />
                  </Form.Item>
                  {!isEditingSelf && (
                    <>
                      <Form.Item
                        name="shiftScheduleId"
                        label="Shift Schedule"
                        rules={[{ required: false }]}
                      >
                        <Select placeholder="Select shift schedule (optional)" allowClear>
                          {shiftSchedules.map((schedule: any) => (
                            <Select.Option key={schedule._id} value={schedule._id}>
                              {schedule.name} ({schedule.shiftStartTime} - {schedule.shiftEndTime})
                              {schedule.isDefault && <span style={{ color: '#1890ff', marginLeft: 8 }}>(Default)</span>}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      {isEditMode && (
                        <Form.Item
                          name="isActive"
                          label="Active Status"
                          valuePropName="checked"
                        >
                          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                        </Form.Item>
                      )}
                    </>
                  )}
                </>
              ),
            },
            ...((canManagePermissions && !isEditingSelf) ? [{
              key: "2",
              label: "Permissions",
              children: (
                <>
                  <Typography.Title level={5} style={{ marginBottom: 12 }}>Module Permissions</Typography.Title>
                  {form.getFieldValue('role') === 'SUPER_ADMIN' && (
                    <Typography.Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
                      <strong>SUPER_ADMIN has full access to all modules and actions.</strong>
                    </Typography.Text>
                  )}
                  <Collapse
                    accordion
                    bordered={false}
                    style={{ background: 'transparent' }}
                    expandIconPosition="end"
                    items={PERMISSION_MODULES.map((mod) => ({
                      key: mod.key,
                      label: (
                        <div>
                          <Typography.Text strong>{mod.label}</Typography.Text>
                        </div>
                      ),
                      style: { background: '#fafafa', borderRadius: 8, marginBottom: 8 },
                      children: (
                        <div>
                          <Form.Item
                            name={['permissions', mod.key]}
                            style={{ marginBottom: 0 }}
                            valuePropName="value"
                          >
                            <Checkbox.Group
                              style={{ width: '100%' }}
                              disabled={form.getFieldValue('role') === 'SUPER_ADMIN'}
                            >
                              <Row gutter={[8, 12]}>
                                {mod.actions.map((action) => (
                                  <Col xs={24} sm={12} md={12} lg={12} key={action.key}>
                                    <Checkbox value={action.key}>
                                      <div>
                                        <div>{action.label}</div>
                                        {action.description && (
                                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                            {action.description}
                                          </Typography.Text>
                                        )}
                                      </div>
                                    </Checkbox>
                                  </Col>
                                ))}
                              </Row>
                            </Checkbox.Group>
                          </Form.Item>
                        </div>
                      ),
                    }))}
                  />
                </>
              ),
            }] : []),
          ]}
        />
      </Form>
    </Modal>
  );
};

export default UserDialog;
