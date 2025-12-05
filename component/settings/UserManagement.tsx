"use client";
import {
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Popconfirm,
  App,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import { USERS_QUERY, DELETE_USER_MUTATION } from "@/graphql/settings/users";
import { useState } from "react";
import UserDialog from "./dialog/userDialog";
import ChangePasswordDialog from "./dialog/changePasswordDialog";
import { StyledDiv } from "../style";

const UserManagement = ({
  currentUserRole,
  currentUserId,
  userPermissions,
}: {
  currentUserRole: string;
  currentUserId: string;
  userPermissions?: Record<string, string[]>;
}) => {
  const { message } = App.useApp();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, loading, refetch } = useQuery(USERS_QUERY);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);

  // Check if user can manage users (create/edit/delete)
  const canManageUsers =
    currentUserRole === "SUPER_ADMIN" || 
    userPermissions?.settings?.includes('manageUsers');
  
  // Check if user can manage permissions
  const canManagePermissions =
    currentUserRole === "SUPER_ADMIN" || 
    userPermissions?.settings?.includes('managePermissions');

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteUser({ variables: { id } });
      if (result.data?.deleteUser?.success) {
        message.success("User deleted successfully");
        refetch();
      } else {
        message.error(
          result.data?.deleteUser?.message || "Failed to delete user"
        );
      }
    } catch (error: any) {
      message.error(error.message || "Failed to delete user");
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleChangePassword = (user: any) => {
    setSelectedUser(user);
    setIsChangePasswordDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "red";
      case "MANAGER":
        return "blue";
      case "CASHIER":
        return "green";
      default:
        return "default";
    }
  };

  const columns: any[] = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (text: string) => text || "-",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      render: (text: string) => text || "-",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_: any, record: any) => {
        const isSelf = record._id === currentUserId;
        return (
          <Space size="small">
            {/* Everyone can change their own password, or manage users can change others */}
            {(isSelf || canManageUsers) && (
              <Button
                type="link"
                icon={<KeyOutlined />}
                onClick={() => handleChangePassword(record)}
                size="small"
              >
                Change Password
              </Button>
            )}
            {/* Only users with manageUsers permission can edit others */}
            {canManageUsers && !isSelf && (
              <>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  size="small"
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete user"
                  description="Are you sure you want to delete this user?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </>
            )}
            {/* Users can edit their own profile info */}
            {isSelf && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              >
                Edit Profile
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Typography.Title level={5}>User Management</Typography.Title>
            <Typography.Text type="secondary">
              Manage user accounts and permissions
            </Typography.Text>
          </div>
          {canManageUsers && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedUser(null);
                setIsUserDialogOpen(true);
              }}
            >
              Add User
            </Button>
          )}
        </Space>
        <StyledDiv>
          {" "}
          <Table
            dataSource={(data?.users || []).filter((user: any) => user.role !== "SUPER_ADMIN")}
            columns={columns}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </StyledDiv>
      </Space>

      {canManageUsers && isUserDialogOpen && (
        <UserDialog
          open={isUserDialogOpen}
          onClose={() => {
            setIsUserDialogOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            refetch();
            setIsUserDialogOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          currentUserId={currentUserId}
          canManagePermissions={canManagePermissions}
        />
      )}

      {isChangePasswordDialogOpen && (
        <ChangePasswordDialog
          open={isChangePasswordDialogOpen}
          onClose={() => {
            setIsChangePasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            refetch();
            setIsChangePasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </Card>
  );
};

export default UserManagement;
