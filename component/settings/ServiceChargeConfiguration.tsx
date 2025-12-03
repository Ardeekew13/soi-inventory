"use client";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { TableProps } from "antd/lib";
import { useState } from "react";

import {
  DELETE_SERVICE_CHARGE,
  GET_SERVICE_CHARGES,
} from "@/graphql/settings/settings";
import AddServiceChargeDialog from "./dialog/addServiceChargeDialog";
import { StyledDiv } from "../style";
import { dateFormatterWithTime } from "@/utils/helper";

interface ServiceCharge {
  _id: string;
  id: string;
  title: string;
  value: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ServiceChargeConfiguration = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ServiceCharge | null>(
    null
  );

  const { data, loading, refetch } = useQuery(GET_SERVICE_CHARGES);

  const [deleteServiceCharge] = useMutation(DELETE_SERVICE_CHARGE, {
    onCompleted: (data) => {
      if (data?.deleteServiceCharge?.success) {
        messageApi.success(data?.deleteServiceCharge?.message);
        refetch();
      } else {
        messageApi.error(
          data?.deleteServiceCharge?.message || "Failed to delete"
        );
      }
    },
    onError: () => {
      messageApi.error("An error occurred while deleting service charge");
    },
  });

  const handleDelete = (id: string) => {
    deleteServiceCharge({
      variables: { id },
    });
  };

  const handleEdit = (record: ServiceCharge) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const columns: TableProps<ServiceCharge>["columns"] = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "40%",
    },
    {
      title: "Value (%)",
      dataIndex: "value",
      key: "value",
      width: "20%",
      align: "right",
      render: (value: number) => `${value}%`,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "20%",
      render: (date: string) => dateFormatterWithTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      align: "center",
      fixed: "right",
      render: (_, record: ServiceCharge) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Service Charge"
            description="Are you sure you want to delete this service charge?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {contextHolder}
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Service Charge
        </Button>
      </div>
      <StyledDiv>
        <Table
          rowKey={(record: ServiceCharge) => record._id.toString()}
          columns={columns}
          dataSource={data?.serviceCharges ?? []}
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
        />
      </StyledDiv>
      {isModalOpen && (
        <AddServiceChargeDialog
          open={isModalOpen}
          onClose={handleCloseModal}
          refetch={refetch}
          messageApi={messageApi}
          record={selectedRecord}
        />
      )}
    </div>
  );
};

export default ServiceChargeConfiguration;
