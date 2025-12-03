"use client";

import { Tabs } from "antd";
import { ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import ShiftTracking from "./ShiftTracking";
import ShiftManagement from "./ShiftManagement";

interface ShiftTrackingWithTabsProps {
  userRole: string;
}

export default function ShiftTrackingWithTabs({ userRole }: ShiftTrackingWithTabsProps) {
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "MANAGER";

  if (!isAdmin) {
    // Regular employees only see their own shift tracking
    return <ShiftTracking />;
  }

  // Admins and managers see both tabs
  return (
    <Tabs
      defaultActiveKey="my-shift"
      items={[
        {
          key: "my-shift",
          label: (
            <span>
              <ClockCircleOutlined /> My Shift
            </span>
          ),
          children: <ShiftTracking />,
        },
        {
          key: "all-shifts",
          label: (
            <span>
              <TeamOutlined /> All Shifts
            </span>
          ),
          children: <ShiftManagement />,
        },
      ]}
    />
  );
}
