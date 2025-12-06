"use client";
import { Item, Mutation, Query } from "@/generated/graphql";
import { REACTIVATE_ITEM } from "@/graphql/inventory/items";
import { CommonStateFilterI } from "@/utility/filters";
import { pesoFormatter } from "@/utils/helper";
import { hasPermission } from "@/utils/permissions";
import { UndoOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";

import {
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import { StyledDiv } from "../style";

interface IProps {
  data: Query["inactiveItemsList"];
  loading: boolean;
  refetch: () => void;
  openModal: (record: Item) => void;
  messageApi: MessageInstance;
  setState: React.Dispatch<React.SetStateAction<CommonStateFilterI>>;
  state: CommonStateFilterI;
  userPermissions?: Record<string, string[]>;
  userRole?: string;
}

const InactiveItemListTable = (props: IProps) => {
  const { data, loading, refetch, openModal, messageApi, state, setState, userPermissions, userRole } = props;

  const [reactivateItem, { loading: reactivateLoading }] = useMutation<Mutation>(
    REACTIVATE_ITEM,
    {
      onCompleted: (data) => {
        if (data?.reactivateItem?.success) {
          messageApi.success(data?.reactivateItem?.message || "Item restored successfully");
          refetch();
        } else {
          messageApi.error(data?.reactivateItem?.message || "Failed to restore item");
        }
      },
      onError: (error) => {
        messageApi.error(`Error: ${error.message}`);
      },
    }
  );

  const handleRestore = (id: string) => {
    reactivateItem({
      variables: {
        id,
      },
    });
  };

  const columns: TableProps<Item>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "50%",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      width: "15%",
    },
    {
      title: "Last Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      width: "10%",
      render: (currentStock: number) => {
        return (
          <Typography.Text>
            {currentStock.toFixed(2)}
          </Typography.Text>
        );
      },
    },
    {
      title: "Price (Per Unit)",
      dataIndex: "pricePerUnit",
      key: "pricePerUnit",
      align: "right",
      width: "15%",
      render: (pricePerUnit: number) => pesoFormatter(pricePerUnit),
    },
    {
      title: "Actions",
      align: "center",
      width: "10%",
      fixed: "right",
      render: (_, record: Item) => {
        return (
          <Space
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <Button type="link" size="small" onClick={() => openModal(record)}>
              View
            </Button>
            {(userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, 'inventory', 'addEdit')) && (
              <Popconfirm
                title="Restore Item"
                description="Are you sure you want to restore this item?"
                onConfirm={() => handleRestore(record?._id)}
                okText="Restore"
                cancelText="Cancel"
              >
                <UndoOutlined style={{ color: "green", cursor: "pointer" }} />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <Input.Search
        placeholder="Search"
        onSearch={(e) => setState((prev) => ({ ...prev, search: e, page: 1 }))}
        enterButton
        allowClear
        defaultValue={state?.search}
      />
      <StyledDiv>
        <Table
          rowKey={(record: Item) => record._id}
          columns={columns}
          loading={loading || reactivateLoading}
          dataSource={data?.items ?? ([] as Item[])}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            current: state?.page,
            pageSize: state.limit,
            total: data?.totalCount ?? 0,
            onChange: (page) => setState((prev) => ({ ...prev, page })),
          }}
        />
      </StyledDiv>
    </div>
  );
};

export default InactiveItemListTable;
