import { StyledDiv } from "@/component/style";
import {
  Mutation,
  Product,
  ProductIngredient,
  Query,
} from "@/generated/graphql";
import { GET_ITEMS } from "@/graphql/inventory/items";
import { ADD_PRODUCT } from "@/graphql/inventory/products";
import { useModal } from "@/hooks/useModal";
import { requiredField } from "@/utils/helper";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  Tag,
  Alert,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import InventoryListModal from "./inventoryListModal";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  record?: Product;
  refetch: () => void;
  messageApi: MessageInstance;
}

interface IngredientItem {
  _id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
}

interface IngredientWithQuantity {
  item: IngredientItem;
  quantityUsed: number;
}

const AddProductModal = (props: ProductModalProps) => {
  const { open, onClose, record, refetch, messageApi } = props;
  const [form] = Form.useForm();
  const [ingredients, setIngredients] = useState<IngredientWithQuantity[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [itemsData, setItemsData] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { openModal, isModalOpen, closeModal } = useModal();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Use lazy query for optimized loading
  const [getItems, { loading: loadingItem }] = useLazyQuery<Query>(GET_ITEMS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.itemsList?.items) {
        const newItems = data.itemsList.items;
        if (page === 0) {
          setItemsData(newItems);
        } else {
          setItemsData((prev) => [...prev, ...newItems]);
        }
        // Check if there are more items to load
        setHasMore(newItems.length === 20);
      }
    },
  });

  // Initialize ingredients when editing
  useEffect(() => {
    if (record?.ingredientsUsed) {
      const formattedIngredients = record.ingredientsUsed.map(
        (ing: ProductIngredient) => ({
          item: {
            _id: ing.item._id,
            name: ing.item.name,
            unit: ing.item.unit,
            pricePerUnit: ing.item.pricePerUnit,
            isActive: (ing.item as any).isActive,
          },
          quantityUsed: ing.quantityUsed,
          isActive: (ing as any).isActive,
        })
      );
      setIngredients(formattedIngredients as IngredientWithQuantity[]);
    }
  }, [record]);

  const [addProduct, { loading }] = useMutation<Mutation>(ADD_PRODUCT, {
    onCompleted: (data) => {
      const response = data?.addProduct as any;
      if (response?.success) {
        messageApi.success(response?.message || "Product saved successfully");
        refetch();
        form.resetFields();
        setIngredients([]);
        setSearchValue("");
        onClose();
      } else {
        messageApi.error(response?.message || "Something went wrong");
      }
    },
    onError: (error) => {
      messageApi.error(error.message || "Failed to save product");
    },
  });

  const handleCloseModal = () => {
    Modal.destroyAll();
    form.resetFields();
    setIngredients([]);
    setSearchValue("");
    onClose();
  };

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(0);
    setItemsData([]);
    setHasMore(true);

    getItems({
      variables: {
        search: value,
        limit: 20,
        skip: 0,
      },
    });
  };

  const handleDropdownOpen = (open: boolean) => {
    if (open && itemsData.length === 0) {
      // Load initial items when dropdown opens for the first time
      setPage(0);
      setHasMore(true);
      getItems({
        variables: {
          search: searchValue || "",
          limit: 20,
          skip: 0,
        },
      });
    }
  };

  // Handle scroll in dropdown for infinite loading
  const handlePopupScroll = (e: any) => {
    const { target } = e;
    const isBottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;

    if (isBottom && hasMore && !loadingItem) {
      const nextPage = page + 1;
      setPage(nextPage);
      getItems({
        variables: {
          search: searchValue,
          limit: 20,
          skip: nextPage * 20,
        },
      });
    }
  };

  // Handle item selection - increment if exists, add if new
  const handleSelectItem = (itemId: string) => {
    const selectedItem = itemsData.find((item) => item._id === itemId);

    if (!selectedItem) return;

    const existingIndex = ingredients.findIndex(
      (ing) => ing.item._id === itemId
    );

    if (existingIndex !== -1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIndex] = {
        ...updatedIngredients[existingIndex],
        quantityUsed: updatedIngredients[existingIndex].quantityUsed + 1,
      };
      setIngredients(updatedIngredients);
      messageApi.success(
        `Increased ${selectedItem.name} quantity to ${updatedIngredients[existingIndex].quantityUsed}`
      );
    } else {
      const newIngredient: IngredientWithQuantity = {
        item: {
          _id: selectedItem._id,
          name: selectedItem.name,
          unit: selectedItem.unit,
          pricePerUnit: selectedItem.pricePerUnit,
        },
        quantityUsed: 1,
      };
      setIngredients([...ingredients, newIngredient]);
    }

    setSearchValue("");
  };

  const handleDecrement = (id: string) => {
    const updatedIngredients = ingredients.map((ingredient) => {
      if (ingredient.item._id === id) {
        return {
          ...ingredient,
          quantityUsed: Math.max(0, ingredient.quantityUsed - 1),
        };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
  };

  const handleIncrement = (id: string) => {
    const updatedIngredients = ingredients.map((ingredient) => {
      if (ingredient.item._id === id) {
        return {
          ...ingredient,
          quantityUsed: ingredient.quantityUsed + 1,
        };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
  };

  const handleQuantityChange = (id: string, value: number) => {
    const updatedIngredients = ingredients.map((ingredient) => {
      if (ingredient.item._id === id) {
        return {
          ...ingredient,
          quantityUsed: value,
        };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
  };

  const handleSubmit = (values: any) => {
    try {
      if (ingredients.length === 0) {
        messageApi.error("Please add at least one ingredient");
        return;
      }

      const itemsPayload = ingredients.map((ingredient) => ({
        itemId: ingredient.item._id,
        quantityUsed: ingredient.quantityUsed,
      }));

      const invalidQuantities = itemsPayload.filter(
        (item) => item.quantityUsed <= 0
      );

      if (invalidQuantities.length > 0) {
        messageApi.error("Quantity of each ingredient must be at least 1");
        return;
      }

      const payload = {
        id: record?._id,
        name: values.name,
        price: values.price,
        items: itemsPayload,
      };

      addProduct({
        variables: {
          ...payload,
        },
      });
    } catch (e: Error | any) {
      messageApi.error(e.message);
    }
  };

  const handleDelete = (id: string) => {
    setIngredients(
      ingredients.filter((ingredient) => ingredient.item._id !== id)
    );
  };

  const columns: TableProps<IngredientWithQuantity>["columns"] = [
    {
      title: "Name",
      dataIndex: ["item", "name"],
      key: "name",
      render: (name: string, record: any) => {
        const isInactive = !record.item.isActive || !record.isActive;
        return (
          <Space>
            {name}
            {isInactive && (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                Inactive
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Unit",
      dataIndex: ["item", "unit"],
      key: "unit",
      width: 100,
    },
    {
      title: "Quantity",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      width: 200,
      align: "center",
      render: (_, record: IngredientWithQuantity) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleDecrement(record.item._id)}
            disabled={record.quantityUsed <= 1}
          >
            -
          </Button>
          <InputNumber
            value={record.quantityUsed}
            onChange={(value) =>
              value !== null && handleQuantityChange(record.item._id, value)
            }
            min={1}
            style={{ width: 60 }}
          />
          <Button size="small" onClick={() => handleIncrement(record.item._id)}>
            +
          </Button>
        </Space>
      ),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      align: "right",
      render: (_, record: IngredientWithQuantity) =>
        `₱${(record.quantityUsed * record.item.pricePerUnit).toFixed(2)}`,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record: IngredientWithQuantity) => (
        <Button danger onClick={() => handleDelete(record.item._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Modal
      destroyOnHidden={true}
      maskClosable={false}
      open={open}
      onCancel={handleCloseModal}
      width={1000}
      centered
      loading={loading}
      title={
        <Typography.Title level={4}>
          <Space align="center">
            {record?._id ? "Edit Product" : "Add Product"}
          </Space>
        </Typography.Title>
      }
      footer={
        <>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button type="primary" form="addProductForm" htmlType="submit">
            {record?._id ? "Update Product" : "Add Product"}
          </Button>
        </>
      }
    >
      <Form
        form={form}
        name="addProductForm"
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: record?.name,
          price: record?.price,
        }}
      >
        {record?._id && ingredients.some((ing: any) => !ing.item.isActive || !ing.isActive) && (
          <Alert
            message="Warning: This product has inactive ingredients"
            description="This product cannot be sold until all ingredients are reactivated. Go to Inventory → Inactive Items to restore them."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="name" label="Product Name" rules={requiredField}>
              <Input placeholder="Enter product name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="price" label="Selling Price" rules={requiredField}>
              <InputNumber
                placeholder="Enter selling price"
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => {
                  const num = Number(value?.replace(/\₱\s?|(,*)/g, ""));
                  return num as 0;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Typography.Text strong>Ingredients</Typography.Text>
        <Row gutter={16} style={{ marginTop: 8, marginBottom: 16 }}>
          <Col span={24}>
            <Select
              showSearch
              value={searchValue}
              placeholder="Search and select ingredients"
              style={{ width: "100%" }}
              loading={loadingItem}
              filterOption={false}
              onSearch={handleSearch}
              onChange={handleSelectItem}
              onOpenChange={handleDropdownOpen}
              onPopupScroll={handlePopupScroll}
              notFoundContent={
                loadingItem
                  ? "Loading..."
                  : itemsData.length === 0
                  ? "No items available"
                  : null
              }
              popupRender={(menu) => (
                <>
                  {menu}
                  {loadingItem && hasMore && itemsData.length > 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        color: "#999",
                      }}
                    >
                      Loading more...
                    </div>
                  )}
                </>
              )}
              options={itemsData.map((item) => ({
                label: `${item.name} - ${item.unit} (₱${item.pricePerUnit})`,
                value: item._id,
              }))}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <InventoryListModal open={isModalOpen} onClose={closeModal} />
            <StyledDiv>
              <Table
                rowKey={(record) => record.item._id}
                columns={columns}
                dataSource={ingredients}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50"],
                  showTotal: (total) =>
                    `Total ${total} ingredient${total !== 1 ? "s" : ""}`,
                  size: "small",
                }}
                size="small"
                tableLayout="auto"
                locale={{
                  emptyText:
                    "No ingredients added yet. Search and select items above.",
                }}
              />
            </StyledDiv>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddProductModal;
