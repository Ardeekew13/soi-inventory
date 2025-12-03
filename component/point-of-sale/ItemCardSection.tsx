import { Button, Card, Space, Typography } from "antd";
import { UnorderedListOutlined, DollarOutlined } from "@ant-design/icons";
import ItemPosCard from "./itemCard";
import { CartProduct } from "@/utils/helper";
import { MessageInstance } from "antd/es/message/interface";
import { Dispatch, SetStateAction } from "react";

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
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Products
          </Typography.Title>

          <Button
            icon={<UnorderedListOutlined />}
            onClick={onOpenParkedOrders}
            size="large"
          >
            Parked Orders ({parkedOrdersCount ?? 0})
          </Button>
        </Space>
      }
      style={{ height: "100%" }}
    >
      <div style={{ height: "100%" }}>
        <ItemPosCard {...tableProps} />
      </div>
    </Card>
  );
};

export default ItemCardSection;
