import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Flex,
  List,
  Space,
  Typography,
} from "antd";
import { StopOutlined } from "@ant-design/icons";
import { dateFormatterWithTime } from "@/utils/helper";
import { Sale } from "@/generated/graphql";

interface ParkedOrdersDrawerProps {
  open: boolean;
  onClose: () => void;
  parkedSales: Sale[];
  onLoadParked: (parked: Sale) => void;
  onVoidParked: (id: string) => void;
}

const ParkedOrdersDrawer = ({
  open,
  onClose,
  parkedSales,
  onLoadParked,
  onVoidParked,
}: ParkedOrdersDrawerProps) => {
  return (
    <Drawer
      title="Parked Orders"
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
    >
      {parkedSales.length === 0 ? (
        <Empty description="No parked orders" />
      ) : (
        <List
          dataSource={parkedSales}
          renderItem={(parked) => (
            <Card
              size="small"
              style={{ marginBottom: 12 }}
              title={
                <Flex justify="space-between">
                  <div>
                    <Typography.Text strong>
                      {parked.orderNo || "New Order"}
                    </Typography.Text>
                    {parked.orderType === "DINE_IN" && parked.tableNumber && (
                      <Typography.Text
                        type="secondary"
                        style={{ marginLeft: 8, fontSize: 12 }}
                      >
                        • Table {parked.tableNumber}
                      </Typography.Text>
                    )}
                  </div>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<StopOutlined />}
                    onClick={() => onVoidParked(parked._id)}
                  />
                </Flex>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {dateFormatterWithTime(parked.updatedAt)}
                </Typography.Text>
                <Flex gap={8} wrap="wrap">
                  <Badge
                    color={parked.orderType === "DINE_IN" ? "blue" : "green"}
                    text={
                      parked.orderType === "DINE_IN" ? "Dine In" : "Take Out"
                    }
                  />
                  {parked.orderType === "DINE_IN" && parked.tableNumber && (
                    <Badge
                      color="orange"
                      text={`Table ${parked.tableNumber}`}
                    />
                  )}
                </Flex>
                <Divider style={{ margin: "8px 0" }} />
                {parked.saleItems?.map((item: any, idx: number) => (
                  <Flex key={idx} justify="space-between">
                    <Typography.Text>
                      {item.product?.name || "(Deleted Product)"} x{item.quantity}
                    </Typography.Text>
                    <Typography.Text>
                      ₱{(item.priceAtSale * item.quantity).toFixed(2)}
                    </Typography.Text>
                  </Flex>
                ))}
                <Divider style={{ margin: "8px 0" }} />
                <Flex justify="space-between">
                  <Typography.Text strong>Total:</Typography.Text>
                  <Typography.Text strong type="success">
                    ₱{parked.totalAmount.toFixed(2)}
                  </Typography.Text>
                </Flex>
                <Button
                  type="primary"
                  block
                  onClick={() => onLoadParked(parked)}
                >
                  Load Order
                </Button>
              </Space>
            </Card>
          )}
        />
      )}
    </Drawer>
  );
};

export default ParkedOrdersDrawer;
