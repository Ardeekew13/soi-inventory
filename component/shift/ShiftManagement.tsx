"use client";

import { useQuery } from "@apollo/client";
import { ALL_SHIFTS_QUERY } from "@/graphql/shift/shiftTracking";
import { Card, Table, Tag, DatePicker, Select, Space, Typography, Image, Modal, Descriptions } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import { useState } from "react";
import { dateFormatterWithTime, dateFormatterWithMonth } from "@/utils/helper";

dayjs.extend(duration);

const { Title } = Typography;
const { Option } = Select;

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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const { data, loading, refetch } = useQuery(ALL_SHIFTS_QUERY, {
    variables: {
      date: selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined,
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
        <Space size="middle">
          <DatePicker
            placeholder="Filter by date"
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              refetch({
                date: date ? date.format("YYYY-MM-DD") : undefined,
                status: statusFilter,
              });
            }}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              refetch({
                date: selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined,
                status: value,
              });
            }}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="IN_PROGRESS">In Progress</Option>
            <Option value="COMPLETED">Completed</Option>
          </Select>
        </Space>
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
