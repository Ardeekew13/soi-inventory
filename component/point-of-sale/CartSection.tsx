import { Button, Card, Flex, Segmented, Space, Typography } from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  ShoppingOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import PosListTable from "./posListTable";
import { CartProduct } from "@/utils/helper";
import { MessageInstance } from "antd/es/message/interface";
import { Dispatch, SetStateAction } from "react";
import { OrderType } from "@/generated/graphql";

interface CartSectionProps {
  cart: CartProduct[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  messageApi: MessageInstance;
  orderType: OrderType;
  tableNumber: string | null;
  currentParkedOrderNo: string | null;
  totalAmount: number;
  parkLoading: boolean;
  currentParkedId: string | null;
  onClearCart: () => void;
  onOrderTypeChange: (value: string | number) => void;
  onSelectTable: () => void;
  onPark: () => void;
  onOpenPayment: () => void;
  onPrintBill: () => void;
}

const CartSection = ({
  cart,
  setCart,
  messageApi,
  orderType,
  tableNumber,
  currentParkedOrderNo,
  totalAmount,
  parkLoading,
  currentParkedId,
  onClearCart,
  onOrderTypeChange,
  onSelectTable,
  onPark,
  onOpenPayment,
  onPrintBill,
}: CartSectionProps) => {
  const posTableProps = {
    cart,
    setCart,
    messageApi,
    hasOrderNo: !!currentParkedOrderNo, // Pass true if order is loaded
  };

  return (
    <Card
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            <ShoppingCartOutlined /> Cart ({cart.length})
          </Typography.Title>
          {currentParkedOrderNo && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {currentParkedOrderNo}
            </Typography.Text>
          )}
        </div>
        {cart.length > 0 && (
          <Button
            danger
            size="small"
            onClick={onClearCart}
            icon={<DeleteOutlined />}
          >
            Clear
          </Button>
        )}
      </Flex>

      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: 16 }}
        size={12}
      >
        <div>
          <Typography.Text strong>Order Type:</Typography.Text>
          <Segmented
            block
            size="large"
            value={orderType}
            onChange={onOrderTypeChange}
            options={[
              {
                label: (
                  <div
                    style={{
                      padding: "4px 8px",
                      color:
                        orderType === OrderType.DineIn ? "#fff" : "inherit",
                    }}
                  >
                    <ShopOutlined /> Dine In
                  </div>
                ),
                value: OrderType.DineIn,
              },
              {
                label: (
                  <div
                    style={{
                      padding: "4px 8px",
                      color:
                        orderType === OrderType.TakeOut ? "#fff" : "inherit",
                    }}
                  >
                    <ShoppingOutlined /> Take Out
                  </div>
                ),
                value: OrderType.TakeOut,
              },
            ]}
            style={{ marginTop: 8 }}
          />
        </div>

        {orderType === OrderType.DineIn && (
          <div>
            <Typography.Text strong>Table:</Typography.Text>
            <Button
              block
              size="large"
              onClick={onSelectTable}
              style={{ marginTop: 8 }}
              type={tableNumber ? "default" : "dashed"}
            >
              <ShopOutlined />{" "}
              {tableNumber ? `Table ${tableNumber}` : "Select Table"}
            </Button>
          </div>
        )}
      </Space>

      <div style={{ flex: 1, marginBottom: 24 }}>
        <PosListTable {...posTableProps} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <Flex justify="space-between" style={{ marginBottom: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Total
          </Typography.Title>
          <Typography.Title level={4} style={{ margin: 0 }} type="success">
            ₱{totalAmount.toFixed(2)}
          </Typography.Title>
        </Flex>

        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          <Button
            size="large"
            block
            onClick={onPark}
            loading={parkLoading}
            disabled={cart.length === 0}
          >
            {currentParkedId ? "Update Park" : "Park Order"}
          </Button>
          <Button
            size="large"
            block
            icon={<PrinterOutlined />}
            onClick={onPrintBill}
            disabled={cart.length === 0}
          >
            Print Bill
          </Button>
          <Button
            type="primary"
            size="large"
            block
            onClick={onOpenPayment}
            disabled={cart.length === 0}
          >
            Checkout & Pay
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default CartSection;
