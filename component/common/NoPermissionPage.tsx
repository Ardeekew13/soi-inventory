"use client";
import { Button, Card, Typography, Space } from "antd";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/graphql/auth/me";
import { Query } from "@/generated/graphql";
import { hasPermission } from "@/utils/permissions";

interface NoPermissionPageProps {
  moduleName?: string;
}

const NoPermissionPage = ({ moduleName }: NoPermissionPageProps) => {
  const router = useRouter();
  const { data: meData } = useQuery<Query>(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  const handleGoHome = () => {
    const userPermissions = meData?.me?.permissions || {};
    const userRole = meData?.me?.role;

    // Redirect to the first page user has access to
    if (userRole === "SUPER_ADMIN" || hasPermission(userPermissions, "dashboard", "view")) {
      router.push("/dashboard");
    } else if (hasPermission(userPermissions, "pointOfSale", "view")) {
      router.push("/point-of-sale");
    } else if (hasPermission(userPermissions, "transaction", "view")) {
      router.push("/transaction");
    } else if (hasPermission(userPermissions, "inventory", "view")) {
      router.push("/inventory");
    } else if (hasPermission(userPermissions, "product", "view")) {
      router.push("/product");
    } else if (hasPermission(userPermissions, "cashDrawer", "view")) {
      router.push("/cash-drawer");
    } else if (hasPermission(userPermissions, "settings", "view")) {
      router.push("/settings");
    } else {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Lock Icon as Vector */}
          <div style={{ fontSize: 80, color: "#ff4d4f" }}>
            <LockOutlined />
          </div>

          <div>
            <Typography.Title level={2} style={{ color: "#ff4d4f", marginBottom: 8 }}>
              Access Denied
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 16 }}>
              You don't have permission to access{" "}
              {moduleName ? `the ${moduleName} module` : "this page"}.
            </Typography.Text>
          </div>

          <Typography.Text type="secondary">
            Please contact your administrator if you believe this is an error.
          </Typography.Text>

          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            style={{ minWidth: 150 }}
          >
            Go Home
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default NoPermissionPage;