import { Product } from "@/generated/graphql";
import { CartProduct } from "@/utils/helper";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Pagination,
  Row,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

interface IProps {
  data: Product[];
  loading: boolean;
  refetch: () => void;
  messageApi: MessageInstance;
  setCart: React.Dispatch<React.SetStateAction<CartProduct[]>>;
  cart: CartProduct[];
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  search: string;
}

const PAGE_SIZE = 16;

const ItemPosCard = (props: IProps) => {
  const {
    data,
    loading,
    refetch,
    messageApi,
    setCart,
    cart,
    search,
    setSearch,
  } = props;
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Check if product has missing or inactive ingredients
  const checkMissingIngredients = (product: Product) => {
    if (!product.ingredientsUsed || product.ingredientsUsed.length === 0) {
      return { hasMissing: false, missingItems: [] };
    }

    const missingItems = product.ingredientsUsed.filter((ing: any) => {
      // Check if item is inactive/missing
      return !ing.item || !ing.item.isActive;
    });

    return {
      hasMissing: missingItems.length > 0,
      missingItems: missingItems.map((ing: any) => ing.item?.name || "Unknown ingredient"),
    };
  };

  const handleAddToCart = (record: Product) => {
    const { hasMissing, missingItems } = checkMissingIngredients(record);

    if (hasMissing) {
      Modal.warning({
        title: "Cannot Add Product",
        icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        content: (
          <div>
            <p>This product cannot be sold because it has missing or inactive ingredients:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {missingItems.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p style={{ marginTop: 12, fontWeight: 500 }}>
              Please restore the inactive ingredients in the Inventory section before selling this product.
            </p>
          </div>
        ),
        okText: "Understood",
      });
      return;
    }

    const existingItem = cart?.find((item) => item?._id === record?._id);
    if (existingItem) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item?._id === record?._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prevCart) => [...prevCart, { ...record, quantity: 1, quantityPrinted: 0 }]);
    }
  };

  const getStockBadgeColor = (units: number) => {
    if (units <= 5) return "red";
    if (units <= 10) return "orange";
    return "green";
  };

  if (loading) {
    return <Skeleton active />;
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const paginatedData = data.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Input.Search
              allowClear
              defaultValue={search}
              onSearch={(value) => setSearch(value)}
              placeholder="Search products..."
              size={isMobile ? "middle" : "large"}
              style={{ marginBottom: 8 }}
            />
          </Col>
          {paginatedData.map((item) => {
            const { hasMissing } = checkMissingIngredients(item);
            return (
            <Col 
              xs={12} 
              sm={12} 
              md={8} 
              lg={6} 
              xl={6}
              key={item?._id}
            >
              <Badge.Ribbon 
                text="Missing Ingredients" 
                color="red"
                style={{ display: hasMissing ? 'block' : 'none' }}
              >
                <Card 
                  hoverable
                  style={{ 
                    borderColor: hasMissing ? "#ff4d4f" : "#1e3a8a",
                    height: "100%",
                    cursor: "pointer",
                    opacity: hasMissing ? 0.7 : 1,
                    overflow: "hidden", // Prevent content overflow
                  }}
                  styles={{ 
                    body: { 
                      padding: isMobile ? "8px" : "16px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }
                  }}
                  onClick={() => handleAddToCart(item)}
                >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? 6 : 8,
                    minHeight: isMobile ? 90 : 120,
                    flex: 1,
                  }}
                >
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Typography.Text 
                      strong 
                      ellipsis={{ tooltip: item.name }}
                      style={{ 
                        fontSize: isMobile ? 12 : 14, 
                        lineHeight: 1.3, 
                        display: 'block',
                        wordBreak: "break-word",
                      }}
                    >
                      {item.name}
                    </Typography.Text>
                  </div>

                  <div
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                      gap: isMobile ? 4 : 8,
                      flexShrink: 0,
                    }}
                  >
                    <Tag 
                      color="blue" 
                      style={{ 
                        fontSize: isMobile ? 11 : 13, 
                        padding: isMobile ? "2px 6px" : "4px 10px",
                        fontWeight: 600,
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ₱{item.price.toFixed(2)}
                    </Tag>
                    
                    <Button
                      type="primary"
                      shape="circle"
                      size={isMobile ? "small" : "middle"}
                      icon={<PlusOutlined style={{ fontSize: isMobile ? 12 : 14 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                    />
                  </div>
                </div>
              </Card>
              </Badge.Ribbon>
            </Col>
            );
          })}
        </Row>
      </div>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={data.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ItemPosCard;
