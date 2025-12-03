"use client";
import { Button, Card, Typography, Space } from "antd";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface NoPermissionPageProps {
  moduleName?: string;
}

const NoPermissionPage = ({ moduleName }: NoPermissionPageProps) => {
  const router = useRouter();

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
            onClick={() => router.push("/dashboard")}
            style={{ minWidth: 150 }}
          >
            Go to Dashboard
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default NoPermissionPage;