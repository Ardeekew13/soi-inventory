"use client";
import { Item, Mutation, Query } from "@/generated/graphql";
import { DELETE_ITEM } from "@/graphql/inventory/items";
import { CommonStateFilterI } from "@/utility/filters";
import { pesoFormatter } from "@/utils/helper";
import { hasPermission } from "@/utils/permissions";
import { DeleteOutlined } from "@ant-design/icons";
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
  data: Query["itemsList"];
  loading: boolean;
  refetch: () => void;
  openModal: (record: Item) => void;
  messageApi: MessageInstance;
  setState: React.Dispatch<React.SetStateAction<CommonStateFilterI>>;
  state: CommonStateFilterI;
  userPermissions?: Record<string, string[]>;
  userRole?: string;
}

const ItemListTable = (props: IProps) => {
  const { data, loading, refetch, openModal, messageApi, state, setState, userPermissions, userRole } = props;
  const warningItem = 20;
  const lowItem = 10;
  const [page, setPage] = useState(1);

  const [deleteItem, { loading: deleteLoading }] = useMutation<Mutation>(
    DELETE_ITEM,
    {
      onCompleted: (data) => {
        if (data?.deleteItem?.success) {
          const message = data?.deleteItem?.message || "Item deleted successfully";
          // Show warning if message contains product information
          if (message.includes("removed from")) {
            messageApi.warning({
              content: message,
              duration: 8, // Show longer for important warnings
            });
          } else {
            messageApi.success(message);
          }
          refetch();
        } else {
          messageApi.error(data?.deleteItem?.message);
        }
      },
    }
  );

  const handleDelete = (id: string) => {
    deleteItem({
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
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      width: "10%",
      render: (currentStock: number) => {
        return (
          <Typography.Text
            style={{
              color:
                currentStock <= lowItem
                  ? "red"
                  : currentStock <= warningItem
                  ? "orange"
                  : "",
            }}
          >
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
            {(userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, 'inventory', 'delete')) && (
              <Popconfirm
                title="Delete Item"
                description={
                  <>
                    Are you sure you want to delete this item?
                    <br />
                    <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                      This will remove the ingredient from all products that use it.
                    </span>
                  </>
                }
                onConfirm={() => handleDelete(record?._id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <DeleteOutlined style={{ color: "red" }} />
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
        onSearch={(e) => setState((prev) => ({ ...prev, filter: e, page: 0 }))}
        enterButton
        allowClear
        defaultValue={state?.search}
      />
      <StyledDiv>
        <Table
          rowKey={(record: Item) => record._id}
          columns={columns}
          loading={loading || deleteLoading}
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

export default ItemListTable;
