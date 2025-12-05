"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import { Tabs, Card, Typography, Space, Spin } from "antd";
import {
  PercentageOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
  TableOutlined,
  PrinterOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import DiscountConfiguration from "@/component/settings/DiscountConfiguration";
import ServiceChargeConfiguration from "@/component/settings/ServiceChargeConfiguration";
import UserManagement from "@/component/settings/UserManagement";
import DatabaseMonitoring from "@/component/settings/DatabaseMonitoring";
import ShiftTrackingWithTabs from "@/component/shift/ShiftTrackingWithTabs";
import ShiftScheduleManagement from "@/component/shift/ShiftScheduleManagement";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useMemo, useEffect } from "react";

const Settings = () => {
  // Permission guard - will redirect if no access
  const { loading, userPermissions, userRole, user } = usePermissionGuard({
    module: "settings",
    action: "view",
  });

  // Check if user can see all tabs (SUPER_ADMIN or MANAGER)
  const canSeeAllTabs = userRole === "SUPER_ADMIN" || userRole === "MANAGER";

  const tabItems = useMemo(() => {
    const allTabs = [
      {
        label: (
          <span>
            <PercentageOutlined /> Discounts
          </span>
        ),
        key: "discount",
        children: <DiscountConfiguration />,
      },
      {
        label: (
          <span>
            <DollarOutlined /> Service Charges
          </span>
        ),
        key: "serviceCharge",
        children: <ServiceChargeConfiguration />,
      },
      {
        label: (
          <span>
            <TableOutlined /> Tables
          </span>
        ),
        key: "tables",
        children: (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Title level={5}>Table Configuration</Typography.Title>
              <Typography.Text type="secondary">
                Manage restaurant tables and seating arrangements
              </Typography.Text>
              <Typography.Text type="warning">
                Coming soon...
              </Typography.Text>
            </Space>
          </Card>
        ),
      },
      {
        label: (
          <span>
            <PrinterOutlined /> Printing
          </span>
        ),
        key: "printing",
        children: (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Title level={5}>Printer Settings</Typography.Title>
              <Typography.Text type="secondary">
                Configure receipt and kitchen printers
              </Typography.Text>
              <Typography.Text type="warning">
                Coming soon...
              </Typography.Text>
            </Space>
          </Card>
        ),
      },
      {
        label: (
          <span>
            <ShopOutlined /> General
          </span>
        ),
        key: "general",
        children: (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Title level={5}>General Settings</Typography.Title>
              <Typography.Text type="secondary">
                Business information, operating hours, and system preferences
              </Typography.Text>
              <Typography.Text type="warning">
                Coming soon...
              </Typography.Text>
            </Space>
          </Card>
        ),
      },
    ];

    const userTab = {
      label: (
        <span>
          <UserOutlined /> Users
        </span>
      ),
      key: "users",
      children: (
        <UserManagement 
          currentUserRole={userRole || ""}
          currentUserId={user?._id || ""}
          userPermissions={userPermissions}
        />
      ),
    };

    const databaseTab = {
      label: (
        <span>
          <DatabaseOutlined /> Database
        </span>
      ),
      key: "database",
      children: <DatabaseMonitoring />,
    };

    const shiftTrackingTab = {
      label: (
        <span>
          <ClockCircleOutlined /> Shift Tracking
        </span>
      ),
      key: "shift-tracking",
      children: <ShiftTrackingWithTabs userRole={userRole || ""} />,
    };

    const shiftScheduleTab = {
      label: (
        <span>
          <ClockCircleOutlined /> Shift Schedules
        </span>
      ),
      key: "shift-schedules",
      children: <ShiftScheduleManagement />,
    };

    // Build tabs based on role
    if (userRole === "SUPER_ADMIN") {
      // SUPER_ADMIN sees everything including database monitoring and shift management
      return [...allTabs, userTab, shiftTrackingTab, shiftScheduleTab, databaseTab];
    } else if (canSeeAllTabs) {
      // MANAGER sees all tabs except database, includes shift management
      return [...allTabs, userTab, shiftTrackingTab, shiftScheduleTab];
    } else {
      // CASHIER sees only shift tracking
      return [shiftTrackingTab];
    }
  }, [canSeeAllTabs, userRole]);


  if (loading) {
    return (
      <PageLayout
        title={
          <CommonPageTitle
            title="Settings"
            subTitle="Manage your system configurations"
          />
        }
      >
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={
        <CommonPageTitle
          title="Settings"
          subTitle="Manage your system configurations"
        />
      }
    >
      <Tabs
        defaultActiveKey={userRole === "CASHIER" ? "shift-tracking" : canSeeAllTabs ? "discount" : "users"}
        size="large"
        items={tabItems}
      />
    </PageLayout>
  );
};

export default Settings;
