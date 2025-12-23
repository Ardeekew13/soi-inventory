import {
  Modal,
  Typography,
  Divider,
  Space,
  Button,
  List,
} from "antd";
import { PrinterOutlined, CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface KitchenReceiptItem {
  _id: string;
  quantity: number;
  quantityPrinted: number;
  product: {
    name: string;
    price: number;
  };
}

interface KitchenReceiptModalProps {
  open: boolean;
  onClose: () => void;
  orderNo: string;
  orderType: string;
  tableNumber: string | null;
  items: KitchenReceiptItem[];
  onSendToKitchen: (itemIds: string[]) => void;
  onPrintReceipt: () => void;
}

const KitchenReceiptModal = ({
  open,
  onClose,
  orderNo,
  orderType,
  tableNumber,
  items,
  onSendToKitchen,
  onPrintReceipt,
}: KitchenReceiptModalProps) => {
  // Calculate unprintedQuantity for each item
  const itemsWithUnprinted = items?.map(item => ({
    ...item,
    unprintedQuantity: (item?.quantity || 0) - (item?.quantityPrinted || 0),
  })) || [];

  const unprintedItems = itemsWithUnprinted.filter((item) => item.unprintedQuantity > 0);
  const printedItems = itemsWithUnprinted.filter((item) => (item.quantityPrinted || 0) > 0);

  // Calculate total amount for all items
  const totalAmount = items?.reduce(
    (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0),
    0
  ) || 0;

  const handleSendUnprinted = () => {
    const unprintedIds = unprintedItems?.map((item) => item?._id).filter(Boolean) || [];
    if (unprintedIds.length > 0) {
      onSendToKitchen(unprintedIds);
    }
  };

  const generateKitchenHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kitchen Order - ${orderNo}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0 auto;
              padding: 10px;
            }
            h1 { 
              text-align: center; 
              font-size: 24px;
              margin: 10px 0;
            }
            h2 {
              text-align: center;
              font-size: 18px;
              margin: 5px 0;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .item { 
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 14px;
            }
            .item-name { 
              flex: 1;
              font-weight: bold;
            }
            .item-qty {
              text-align: right;
              font-weight: bold;
              min-width: 50px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .section-title {
              font-weight: bold;
              font-size: 16px;
              margin: 10px 0;
              text-decoration: underline;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px dashed #000;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KITCHEN ORDER</h1>
            <h2>${orderNo}</h2>
            <div><strong>Type:</strong> ${
              orderType === "DINE_IN" ? "DINE-IN" : "TAKE-OUT"
            }</div>
            ${
              tableNumber
                ? `<div><strong>Table:</strong> ${tableNumber}</div>`
                : ""
            }
            <div>${dayjs().format("MMM D, YYYY h:mm A")}</div>
          </div>
          
          ${
            unprintedItems?.length > 0
              ? `
            <div class="section-title">NEW ITEMS:</div>
            ${unprintedItems
              ?.map(
                (item) => `
              <div class="item">
                <span class="item-name">${item?.product?.name || 'Unknown'}</span>
                <span class="item-qty">x${item?.unprintedQuantity || 0}</span>
              </div>
            `
              )
              .join("")}
          `
              : ""
          }

          <div class="divider"></div>
          <div class="footer">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
              TOTAL ORDER AMOUNT: ₱${totalAmount?.toFixed(2) || '0.00'}
            </div>
            <div><strong>Total Items: ${items?.reduce(
              (sum, item) => sum + (item?.quantity || 0),
              0
            ) || 0}</strong></div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintKitchen = async () => {
    // Open print window and print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generateKitchenHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      
      // Mark unprinted items as printed
      if (unprintedItems?.length > 0) {
        handleSendUnprinted();
      }
      
      // Close modal after printing
      setTimeout(() => {
        printWindow.close();
        onClose();
      }, 500);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Kitchen Order Summary
          </Typography.Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={500}
      footer={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrintKitchen}
            disabled={(unprintedItems?.length || 0) === 0}
          >
            {(unprintedItems?.length || 0) > 0 
              ? `Print to Kitchen (${unprintedItems?.length} new)` 
              : "All Items Sent"}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {/* Order Header */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            borderBottom: "2px dashed #d9d9d9",
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            {orderNo}
          </Typography.Title>
          <Typography.Text type="secondary">
            {orderType === "DINE_IN" ? "DINE-IN" : "TAKE-OUT"}
            {tableNumber && ` • Table ${tableNumber}`}
          </Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs().format("MMM D, YYYY h:mm A")}
            </Typography.Text>
          </div>
        </div>

        {/* Unprinted Items */}
        {(unprintedItems?.length || 0) > 0 && (
          <div>
            <Typography.Title level={5} style={{ color: "#ff4d4f" }}>
              NEW ITEMS ({unprintedItems?.length || 0})
            </Typography.Title>
            <List
              size="small"
              dataSource={unprintedItems || []}
              renderItem={(item) => (
                <List.Item>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Typography.Text strong>
                      {item?.product?.name || 'Unknown'}
                    </Typography.Text>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      x{item?.unprintedQuantity || 0}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Total Amount */}
        <Divider style={{ margin: "8px 0" }} />
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text strong style={{ fontSize: 16 }}>
              TOTAL ORDER AMOUNT:
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0, color: "#52c41a" }}>
              ₱{totalAmount?.toFixed(2) || '0.00'}
            </Typography.Title>
          </Space>
        </div>

        {(unprintedItems?.length || 0) === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckOutlined style={{ fontSize: 48, color: "#52c41a" }} />
            <Typography.Title level={4} style={{ marginTop: 16 }}>
              All items sent to kitchen
            </Typography.Title>
            <Typography.Text type="secondary">
              No new items to send
            </Typography.Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default KitchenReceiptModal;
