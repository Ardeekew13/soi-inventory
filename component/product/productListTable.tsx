"use client";
import { Mutation, Product, Query } from "@/generated/graphql";
import { DELETE_PRODUCT } from "@/graphql/inventory/products";
import { GET_PRODUCTS_BY_INGREDIENT } from "@/graphql/inventory/productsByIngredient";
import { GET_ITEMS } from "@/graphql/inventory/items";
import { pesoFormatter } from "@/utils/helper";
import { hasPermission } from "@/utils/permissions";
import { DeleteOutlined, FilterOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { useState } from "react";
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

const ProductListTable = (props: IProps) => {
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

  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null
  );
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Get all items for the dropdown
  const { data: itemsData } = useQuery<Query>(GET_ITEMS, {
    variables: { search: "", limit: 1000, skip: 0 },
  });

  // Lazy query for filtering by ingredient
  const [getProductsByIngredient, { loading: filterLoading }] =
    useLazyQuery<Query>(GET_PRODUCTS_BY_INGREDIENT, {
      onCompleted: (data) => {
        setFilteredProducts((data?.productsByIngredient as Product[]) || []);
      },
      onError: (error) => {
        messageApi.error(`Error filtering products: ${error.message}`);
      },
    });

  const handleIngredientFilter = (itemId: string | null) => {
    setSelectedIngredient(itemId);
    if (itemId) {
      getProductsByIngredient({ variables: { itemId } });
    } else {
      setFilteredProducts([]);
    }
  };

  const displayData = selectedIngredient ? filteredProducts : data;

  // Check if product has missing or inactive ingredients
  const checkMissingIngredients = (product: Product) => {
    if (!product.ingredientsUsed || product.ingredientsUsed.length === 0) {
      return { hasMissing: false, missingCount: 0 };
    }

    const missingCount = product.ingredientsUsed.filter((ing: any) => {
      return !ing.item || !ing.item.isActive;
    }).length;

    return {
      hasMissing: missingCount > 0,
      missingCount,
    };
  };

  const [deleteProduct, { loading: deleteLoading }] = useMutation<Mutation>(
    DELETE_PRODUCT,
    {
      onCompleted: (data) => {
        if (data?.deleteProduct?.success) {
          messageApi.success(data?.deleteProduct?.message);
          refetch();
        } else {
          messageApi.error(data?.deleteItem?.message);
        }
      },
    }
  );

  const handleDelete = (id: string) => {
    deleteProduct({
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
      width: "70%",
      render: (name: string, record: Product) => {
        const { hasMissing, missingCount } = checkMissingIngredients(record);
        return (
          <Space>
            {name}
            {hasMissing && (
              <Tooltip title={`This product has ${missingCount} inactive ingredient(s)`}>
                <ExclamationCircleFilled style={{ color: "#ff4d4f" }} />
              </Tooltip>
            )}
          </Space>
        );
      },
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
              hasPermission(userPermissions, "product", "delete")) && (
              <Popconfirm
                title="Delete Item"
                description="Are you sure you want to delete this item?"
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
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={18}>
          <Input.Search
            placeholder="Search products"
            onSearch={setSearch}
            enterButton
            allowClear
            defaultValue={search}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filter by ingredient"
            allowClear
            showSearch
            style={{ width: "100%" }}
            value={selectedIngredient}
            onChange={handleIngredientFilter}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={
              itemsData?.itemsList?.items?.map((item: any) => ({
                label: item.name,
                value: item._id,
              })) || []
            }
          />
        </Col>
      </Row>

      <StyledDiv>
        <Table
          rowKey={(record: Product) => record?._id}
          columns={columns}
          loading={loading || deleteLoading || filterLoading}
          dataSource={displayData ?? ([] as Product[])}
          size="small"
          scroll={{ x: 800 }}
        />
      </StyledDiv>
    </div>
  );
};

export default ProductListTable;
