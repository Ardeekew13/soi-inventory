"use client";
import { Mutation, Product, Query } from "@/generated/graphql";
import { REACTIVATE_PRODUCT } from "@/graphql/inventory/products";
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
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { StyledDiv } from "../style";

interface IProps {
  data: Product[];
  loading: boolean;
  refetch: () => void;
  messageApi: MessageInstance;
  openModal: (record: Product) => void;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  search: string;
  userPermissions?: Record<string, string[]>;
  userRole?: string;
}

const InactiveProductListTable = (props: IProps) => {
  const {
    data,
    loading,
    refetch,
    openModal,
    messageApi,
    setSearch,
    search,
    userPermissions,
    userRole,
  } = props;

  const [reactivateProduct, { loading: reactivateLoading }] = useMutation<Mutation>(
    REACTIVATE_PRODUCT,
    {
      onCompleted: (data) => {
        if (data?.reactivateProduct?.success) {
          messageApi.success(data?.reactivateProduct?.message || "Product restored successfully");
          refetch();
        } else {
          messageApi.error(data?.reactivateProduct?.message || "Failed to restore product");
        }
      },
      onError: (error) => {
        messageApi.error(`Error: ${error.message}`);
      },
    }
  );

  const handleRestore = (id: string) => {
    reactivateProduct({
      variables: {
        id,
      },
    });
  };

  const columns: TableProps<Product>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "80%",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: "10%",
      align: "right",
      render: (pricePerUnit: number) => pesoFormatter(pricePerUnit),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "10%",
      align: "center",
      fixed: "right",
      render: (_, record: Product) => {
        return (
          <Space
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <Button type="link" size="small" onClick={() => openModal(record)}>
              View
            </Button>
            {(userRole === "SUPER_ADMIN" ||
              hasPermission(userPermissions, "product", "addEdit")) && (
              <Popconfirm
                title="Restore Product"
                description="Are you sure you want to restore this product?"
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
        placeholder="Search products"
        onSearch={setSearch}
        enterButton
        allowClear
        defaultValue={search}
      />

      <StyledDiv>
        <Table
          rowKey={(record: Product) => record?._id}
          columns={columns}
          loading={loading || reactivateLoading}
          dataSource={data ?? ([] as Product[])}
          size="small"
          scroll={{ x: 800 }}
        />
      </StyledDiv>
    </div>
  );
};

export default InactiveProductListTable;
