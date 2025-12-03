import { Product } from "@/generated/graphql";
import { CartProduct } from "@/utils/helper";
import { PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Pagination,
  Row,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { useState } from "react";

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

  const handleAddToCart = (record: Product) => {
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
        <Row gutter={[16, 16]}>
          <Input.Search
            allowClear
            defaultValue={search}
            onSearch={(value) => setSearch(value)}
            style={{ paddingRight: 8, paddingLeft: 8 }}
          />
          {paginatedData.map((item) => (
            <Col lg={6} md={8} sm={24} xs={24} key={item?._id}>
              <Card 
                hoverable
                style={{ 
                  borderColor: "#1e3a8a",
                  height: "100%",
                  cursor: "pointer"
                }}
                onClick={() => handleAddToCart(item)}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    minHeight: 120,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Typography.Text 
                      strong 
                      ellipsis={{ tooltip: item.name }}
                      style={{ fontSize: 16, lineHeight: 1.4, display: 'block' }}
                    >
                      {item.name}
                    </Typography.Text>
                  </div>

                  <div
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto"
                    }}
                  >
                    <Tag 
                      color="blue" 
                      style={{ 
                        fontSize: 14, 
                        padding: "7px 14px",
                        fontWeight: 600,
                        margin: 0
                      }}
                    >
                      ₱{item.price.toFixed(2)}
                    </Tag>
                    
                    <Button
                      type="primary"
                      shape="circle"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
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
