import { Button, Card, Space, Typography } from "antd";
import { UnorderedListOutlined, DollarOutlined } from "@ant-design/icons";
import ItemPosCard from "./itemCard";
import { CartProduct } from "@/utils/helper";
import { MessageInstance } from "antd/es/message/interface";
import { Dispatch, SetStateAction } from "react";
import { useMediaQuery } from "react-responsive";

interface ItemCardSectionProps {
  products: any[];
  loading: boolean;
  refetch: () => void;
  messageApi: MessageInstance;
  cart: CartProduct[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  parkedOrdersCount: number;
  onOpenParkedOrders: () => void;
}

const ItemCardSection = ({
  products,
  loading,
  refetch,
  messageApi,
  cart,
  setCart,
  search,
  setSearch,
  parkedOrdersCount,
  onOpenParkedOrders,
}: ItemCardSectionProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isSmall = useMediaQuery({ maxWidth: 575 });
  
  const tableProps = {
    data: products,
    loading,
    refetch,
    messageApi,
    cart,
    setCart,
    search,
    setSearch,
  };

  return (
    <Card
      title={
        <Space 
          style={{ width: "100%", justifyContent: "space-between" }}
          wrap
          size={[8, 8]}
        >
          <Typography.Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 20 }}>
            Products
          </Typography.Title>

          <Button
            icon={<UnorderedListOutlined />}
            onClick={onOpenParkedOrders}
            size={isMobile ? "middle" : "large"}
          >
            <span style={{ display: isSmall ? 'none' : 'inline' }}>
              Parked Orders 
            </span>
            ({parkedOrdersCount ?? 0})
          </Button>
        </Space>
      }
      style={{ height: "100%" }}
      styles={{ 
        body: { 
          height: "calc(100% - 60px)", 
          overflowY: "auto",
          padding: isMobile ? "12px" : "24px"
        }
      }}
    >
      <div style={{ height: "100%" }}>
        <ItemPosCard {...tableProps} />
      </div>
    </Card>
  );
};

export default ItemCardSection;
