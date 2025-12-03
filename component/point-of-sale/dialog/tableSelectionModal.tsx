import { Modal, Row, Col, Card, Typography, Badge } from "antd";
import { CheckCircleFilled, ShopOutlined } from "@ant-design/icons";

interface TableSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTable: (tableNumber: string) => void;
  selectedTable: string | null;
  occupiedTables?: string[];
}

// Generate table numbers (configurable)
const TOTAL_TABLES = 20;
const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => (i + 1).toString());

const TableSelectionModal = ({
  open,
  onClose,
  onSelectTable,
  selectedTable,
  occupiedTables = [],
}: TableSelectionModalProps) => {
  const handleSelectTable = (tableNumber: string) => {
    onSelectTable(tableNumber);
    onClose();
  };

  const isOccupied = (tableNumber: string) => occupiedTables.includes(tableNumber);
  const isSelected = (tableNumber: string) => selectedTable === tableNumber;

  return (
    <Modal
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          <ShopOutlined /> Select Table
        </Typography.Title>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Typography.Paragraph type="secondary">
        Click on a table to select it for dine-in order
      </Typography.Paragraph>

      <Row gutter={[12, 12]}>
        {tables.map((tableNumber) => {
          const occupied = isOccupied(tableNumber);
          const selected = isSelected(tableNumber);

          return (
            <Col xs={6} sm={4} key={tableNumber}>
              <Badge.Ribbon
                text="Occupied"
                color="red"
                style={{ display: occupied ? "block" : "none" }}
              >
                <Card
                  hoverable={!occupied}
                  onClick={() => !occupied && handleSelectTable(tableNumber)}
                  style={{
                    textAlign: "center",
                    cursor: occupied ? "not-allowed" : "pointer",
                    backgroundColor: selected
                      ? "#e6f7ff"
                      : occupied
                      ? "#f5f5f5"
                      : "#fff",
                    borderColor: selected ? "#1890ff" : occupied ? "#d9d9d9" : "#d9d9d9",
                    borderWidth: selected ? 2 : 1,
                    opacity: occupied ? 0.6 : 1,
                    position: "relative",
                    minHeight: 80,
                  }}
                  styles={{
                    body: {
                      padding: "12px 8px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  }}
                >
                  {selected && (
                    <CheckCircleFilled
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        color: "#1890ff",
                        fontSize: 16,
                      }}
                    />
                  )}
                  <Typography.Title
                    level={4}
                    style={{
                      margin: 0,
                      color: selected ? "#1890ff" : occupied ? "#999" : "#000",
                    }}
                  >
                    {tableNumber}
                  </Typography.Title>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 11, marginTop: 4 }}
                  >
                    Table
                  </Typography.Text>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}
      </Row>

      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 16, marginBottom: 0, fontSize: 12 }}
      >
        <span style={{ color: "#1890ff" }}>● Selected</span> &nbsp;&nbsp;
        <span style={{ color: "#ff4d4f" }}>● Occupied</span> &nbsp;&nbsp;
        <span style={{ color: "#52c41a" }}>● Available</span>
      </Typography.Paragraph>
    </Modal>
  );
};

export default TableSelectionModal;
