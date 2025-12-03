"use client";

import {
  SHIFT_SCHEDULES_QUERY,
  CREATE_SHIFT_SCHEDULE_MUTATION,
  UPDATE_SHIFT_SCHEDULE_MUTATION,
  DELETE_SHIFT_SCHEDULE_MUTATION,
} from "@/graphql/shift/shiftSchedule";
import {
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Table,
  Tag,
  Space,
  Typography,
  App,
  Modal,
  Form,
  Input,
  TimePicker,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text } = Typography;

interface ShiftSchedule {
  _id: string;
  name: string;
  shiftStartTime: string;
  breakStartTime: string;
  breakEndTime: string;
  shiftEndTime: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ShiftScheduleManagement() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ShiftSchedule | null>(
    null
  );

  const { data, loading, refetch } = useQuery(SHIFT_SCHEDULES_QUERY);
  const [createSchedule, { loading: creating }] = useMutation(
    CREATE_SHIFT_SCHEDULE_MUTATION
  );
  const [updateSchedule, { loading: updating }] = useMutation(
    UPDATE_SHIFT_SCHEDULE_MUTATION
  );
  const [deleteSchedule] = useMutation(DELETE_SHIFT_SCHEDULE_MUTATION);

  const schedules = (data?.shiftSchedules as ShiftSchedule[]) || [];

  const openModal = (schedule?: ShiftSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      form.setFieldsValue({
        name: schedule.name,
        shiftStartTime: dayjs(schedule.shiftStartTime, "HH:mm"),
        breakStartTime: dayjs(schedule.breakStartTime, "HH:mm"),
        breakEndTime: dayjs(schedule.breakEndTime, "HH:mm"),
        shiftEndTime: dayjs(schedule.shiftEndTime, "HH:mm"),
        isDefault: schedule.isDefault,
      });
    } else {
      setEditingSchedule(null);
      form.resetFields();
      form.setFieldsValue({
        isDefault: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      const input = {
        name: values.name,
        shiftStartTime: values.shiftStartTime.format("HH:mm"),
        breakStartTime: values.breakStartTime.format("HH:mm"),
        breakEndTime: values.breakEndTime.format("HH:mm"),
        shiftEndTime: values.shiftEndTime.format("HH:mm"),
        isDefault: values.isDefault || false,
      };

      if (editingSchedule) {
        await updateSchedule({
          variables: {
            input: {
              id: editingSchedule._id,
              ...input,
            },
          },
        });
        message.success("Shift schedule updated successfully");
      } else {
        await createSchedule({
          variables: { 
            input: input,
          },
        });
        message.success("Shift schedule created successfully");
      }

      await refetch();
      closeModal();
    } catch (error: any) {
      message.error(error.message || "Failed to save shift schedule");
    }
  };

  const handleDelete = (schedule: ShiftSchedule) => {
    modal.confirm({
      title: "Delete Shift Schedule",
      content: `Are you sure you want to delete "${schedule.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSchedule({
            variables: { id: schedule._id },
          });
          message.success("Shift schedule deleted successfully");
          await refetch();
        } catch (error: any) {
          message.error(error.message || "Failed to delete shift schedule");
        }
      },
    });
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateSchedule({
        variables: {
          input: {
            id: id,
            isDefault: true,
          },
        },
      });
      message.success("Default shift schedule updated");
      await refetch();
    } catch (error: any) {
      message.error(error.message || "Failed to set default schedule");
    }
  };

  const columns = [
    {
      title: "Schedule Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Shift Start",
      dataIndex: "shiftStartTime",
      key: "shiftStartTime",
      render: (time: string) => <Tag color="green">{time}</Tag>,
    },
    {
      title: "Break Start",
      dataIndex: "breakStartTime",
      key: "breakStartTime",
      render: (time: string) => <Tag color="orange">{time}</Tag>,
    },
    {
      title: "Break End",
      dataIndex: "breakEndTime",
      key: "breakEndTime",
      render: (time: string) => <Tag color="blue">{time}</Tag>,
    },
    {
      title: "Shift End",
      dataIndex: "shiftEndTime",
      key: "shiftEndTime",
      render: (time: string) => <Tag color="red">{time}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: ShiftSchedule) => (
        <Space>
          <Tag color={record.isActive ? "success" : "default"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
          {record.isDefault ? (
            <Tag color="blue">Default</Tag>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={() => handleSetDefault(record._id)}
            >
              Set as Default
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ShiftSchedule) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Shift Schedule Management</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Create Schedule
          </Button>
        }
      >
        <Table
          dataSource={schedules}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingSchedule ? "Edit Shift Schedule" : "Create Shift Schedule"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            shiftStartTime: dayjs("08:00", "HH:mm"),
            breakStartTime: dayjs("12:00", "HH:mm"),
            breakEndTime: dayjs("13:00", "HH:mm"),
            shiftEndTime: dayjs("17:00", "HH:mm"),
          }}
        >
          <Form.Item
            label="Schedule Name"
            name="name"
            rules={[
              { required: true, message: "Please enter schedule name" },
            ]}
          >
            <Input placeholder="e.g., Morning Shift, Night Shift" />
          </Form.Item>

          <Form.Item
            label="Shift Start Time"
            name="shiftStartTime"
            rules={[
              { required: true, message: "Please select shift start time" },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Break Start Time"
            name="breakStartTime"
            rules={[
              { required: true, message: "Please select break start time" },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Break End Time"
            name="breakEndTime"
            rules={[
              { required: true, message: "Please select break end time" },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Shift End Time"
            name="shiftEndTime"
            rules={[
              { required: true, message: "Please select shift end time" },
            ]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="isDefault"
            valuePropName="checked"
          >
            <Checkbox>
              Set as default schedule (will be auto-selected when creating new users)
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating || updating}
              >
                {editingSchedule ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
