"use client";

import { useQuery } from "@apollo/client";
import { ALL_SHIFTS_QUERY } from "@/graphql/shift/shiftTracking";
import { USERS_QUERY } from "@/graphql/settings/users";
import { Card, Table, Tag, DatePicker, Select, Space, Typography, Image, Modal, Descriptions, Row, Col } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import { useState } from "react";
import { dateFormatterWithTime, dateFormatterWithMonth } from "@/utils/helper";

dayjs.extend(duration);

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ShiftEvent {
  _id: string;
  eventType: string;
  timestamp: string;
  photo: string;
  notes: string;
}

interface Shift {
  _id: string;
  userId: string;
  employeeName: string;
  date: string;
  events: ShiftEvent[];
  totalHoursWorked: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const eventTypeLabels: Record<string, string> = {
  SHIFT_START: "Shift Start",
  LUNCH_BREAK_START: "Lunch Break Start",
  LUNCH_BREAK_END: "Lunch Break End",
  SHIFT_END: "Shift End",
};

export default function ShiftManagement() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Fetch users for employee filter
  const { data: usersData } = useQuery(USERS_QUERY);
  const users = usersData?.users || [];

  const { data, loading, refetch } = useQuery(ALL_SHIFTS_QUERY, {
    variables: {
      startDate: dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
      endDate: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      userId: selectedUserId,
      status: statusFilter,
      limit: 100,
      offset: 0,
    },
  });

  const shifts = (data?.allShifts as Shift[]) || [];

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: (a: Shift, b: Shift) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dateFormatterWithMonth(date),
      sorter: (a: Shift, b: Shift) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Shift Start",
      key: "shiftStart",
      render: (_: any, record: Shift) => {
        const startEvent = record.events.find((e: any) => e.eventType === "SHIFT_START");
        return startEvent ? dayjs(startEvent.timestamp).format("hh:mm A") : "-";
      },
    },
    {
      title: "Break Start",
      key: "breakStart",
      render: (_: any, record: Shift) => {
        const breakStartEvent = record.events.find((e: any) => e.eventType === "LUNCH_BREAK_START");
        return breakStartEvent ? dayjs(breakStartEvent.timestamp).format("hh:mm A") : "-";
      },
    },
    {
      title: "Break End",
      key: "breakEnd",
      render: (_: any, record: Shift) => {
        const breakEndEvent = record.events.find((e: any) => e.eventType === "LUNCH_BREAK_END");
        return breakEndEvent ? dayjs(breakEndEvent.timestamp).format("hh:mm A") : "-";
      },
    },
    {
      title: "Shift End",
      key: "shiftEnd",
      render: (_: any, record: Shift) => {
        const endEvent = record.events.find((e: any) => e.eventType === "SHIFT_END");
        return endEvent ? dayjs(endEvent.timestamp).format("hh:mm A") : "-";
      },
    },
    {
      title: "Hours Worked",
      dataIndex: "totalHoursWorked",
      key: "totalHoursWorked",
      render: (hours: number) => {
        if (!hours) return "-";
        const dur = dayjs.duration(hours, "hours");
        return `${dur.hours()}h ${dur.minutes()}m`;
      },
      sorter: (a: Shift, b: Shift) => (a.totalHoursWorked || 0) - (b.totalHoursWorked || 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "success" : "processing"}>
          {status.replace(/_/g, " ")}
        </Tag>
      ),
      filters: [
        { text: "In Progress", value: "IN_PROGRESS" },
        { text: "Completed", value: "COMPLETED" },
      ],
      onFilter: (value: any, record: Shift) => record.status === value,
    },
    {
      title: "Events",
      dataIndex: "events",
      key: "events",
      render: (events: ShiftEvent[]) => `${events.length} events`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Shift) => (
        <a onClick={() => setSelectedShift(record)}>View Details</a>
      ),
    },
  ];

  const eventColumns = [
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      render: (type: string) => eventTypeLabels[type] || type,
    },
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => dateFormatterWithTime(timestamp),
    },
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (photo: string) => (
        <Image
          src={photo}
          alt="Event photo"
          width={80}
          height={60}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "-",
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ClockCircleOutlined /> Shift Management
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
              }}
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by employee"
              value={selectedUserId}
              onChange={(value) => {
                setSelectedUserId(value);
              }}
              style={{ width: "100%" }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map((user: any) => (
                <Option key={user._id} value={user._id}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName} (${user.username})`
                    : user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
              }}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={shifts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Shift Details Modal */}
      <Modal
        title="Shift Details"
        open={!!selectedShift}
        onCancel={() => setSelectedShift(null)}
        footer={null}
        width={900}
      >
        {selectedShift && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Employee">
                {selectedShift.employeeName}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {dayjs(selectedShift.date).format("MMMM DD, YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedShift.status === "COMPLETED" ? "success" : "processing"}>
                  {selectedShift.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Hours">
                {selectedShift.totalHoursWorked ? (
                  (() => {
                    const dur = dayjs.duration(selectedShift.totalHoursWorked, "hours");
                    return `${dur.hours()}h ${dur.minutes()}m`;
                  })()
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>Events Timeline</Title>
              <Table
                dataSource={selectedShift.events}
                columns={eventColumns}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
