"use client";
import {
  Modal,
  Typography,
  Space,
  Button,
  InputNumber,
  List,
  Divider,
  Tag,
  Card,
  Input,
  message,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  DollarOutlined,
  CloseCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_CURRENT_CASH_DRAWER,
  OPEN_CASH_DRAWER,
  CLOSE_CASH_DRAWER,
  ADD_CASH_IN,
  ADD_CASH_OUT,
} from "@/graphql/cash-drawer/cash-drawer";
import { pesoFormatter } from "@/utils/helper";
import dayjs from "dayjs";

interface CashDrawerModalProps {
  open: boolean;
  onClose: () => void;
}

const CashDrawerModal = ({ open, onClose }: CashDrawerModalProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [closingBalance, setClosingBalance] = useState<number>(0);
  const [cashInAmount, setCashInAmount] = useState<number>(0);
  const [cashInDescription, setCashInDescription] = useState<string>("");
  const [cashOutAmount, setCashOutAmount] = useState<number>(0);
  const [cashOutDescription, setCashOutDescription] = useState<string>("");
  const [showCashIn, setShowCashIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const { data, loading, refetch } = useQuery(GET_CURRENT_CASH_DRAWER);
  const currentDrawer = data?.currentCashDrawer;

  const [openDrawer, { loading: openLoading }] = useMutation(OPEN_CASH_DRAWER, {
    onCompleted: (data) => {
      if (data?.openCashDrawer?.success) {
        messageApi.success(data.openCashDrawer.message);
        setOpeningBalance(0);
        refetch();
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [closeDrawer, { loading: closeLoading }] = useMutation(CLOSE_CASH_DRAWER, {
    onCompleted: (data) => {
      if (data?.closeCashDrawer?.success) {
        messageApi.success(data.closeCashDrawer.message);
        setClosingBalance(0);
        setShowClose(false);
        refetch();
        onClose();
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [addCashIn, { loading: cashInLoading }] = useMutation(ADD_CASH_IN, {
    onCompleted: (data) => {
      if (data?.addCashIn?.success) {
        messageApi.success(data.addCashIn.message);
        setCashInAmount(0);
        setCashInDescription("");
        setShowCashIn(false);
        refetch();
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [addCashOut, { loading: cashOutLoading }] = useMutation(ADD_CASH_OUT, {
    onCompleted: (data) => {
      if (data?.addCashOut?.success) {
        messageApi.success(data.addCashOut.message);
        setCashOutAmount(0);
        setCashOutDescription("");
        setShowCashOut(false);
        refetch();
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const handleOpenDrawer = () => {
    if (openingBalance < 0) {
      messageApi.error("Opening balance cannot be negative");
      return;
    }
    openDrawer({ variables: { openingBalance } });
  };

  const handleCloseDrawer = () => {
    if (closingBalance < 0) {
      messageApi.error("Closing balance cannot be negative");
      return;
    }
    closeDrawer({ variables: { closingBalance } });
  };

  const handleAddCashIn = () => {
    if (cashInAmount <= 0) {
      messageApi.error("Amount must be greater than 0");
      return;
    }
    if (!cashInDescription.trim()) {
      messageApi.error("Description is required");
      return;
    }
    addCashIn({ variables: { amount: cashInAmount, description: cashInDescription } });
  };

  const handleAddCashOut = () => {
    if (cashOutAmount <= 0) {
      messageApi.error("Amount must be greater than 0");
      return;
    }
    if (!cashOutDescription.trim()) {
      messageApi.error("Description is required");
      return;
    }
    addCashOut({ variables: { amount: cashOutAmount, description: cashOutDescription } });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "OPENING":
        return "blue";
      case "CASH_IN":
        return "green";
      case "CASH_OUT":
        return "red";
      case "SALE":
        return "cyan";
      case "CLOSING":
        return "purple";
      default:
        return "default";
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Cash Drawer
            </Typography.Title>
          </Space>
        }
        open={open}
        onCancel={onClose}
        width={700}
        footer={null}
      >
        {!currentDrawer ? (
          // Open Drawer Section
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            <Typography.Text>No cash drawer is currently open. Open a new drawer to start.</Typography.Text>
            
            <div>
              <Typography.Text strong>Opening Balance:</Typography.Text>
              <InputNumber
                size="large"
                style={{ width: "100%", marginTop: 8 }}
                value={openingBalance}
                onChange={(value) => setOpeningBalance(value || 0)}
                min={0}
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              icon={<DollarOutlined />}
              onClick={handleOpenDrawer}
              loading={openLoading}
            >
              Open Cash Drawer
            </Button>
          </Space>
        ) : (
          // Drawer Open - Show Current State
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {/* Summary Cards */}
            <Card size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Current Balance"
                    value={currentDrawer.currentBalance}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Col>
                <Col span={12}>
                  <Typography.Text type="secondary">
                    Opened by: <strong>{currentDrawer.openedBy}</strong>
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {dayjs(parseInt(currentDrawer.openedAt)).format("MMM D, YYYY h:mm A")}
                  </Typography.Text>
                </Col>
              </Row>
            </Card>

            {/* Summary Row */}
            <Row gutter={8}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Cash In"
                    value={currentDrawer.totalCashIn}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 16, color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Sales"
                    value={currentDrawer.totalSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 16, color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Cash Out"
                    value={currentDrawer.totalCashOut}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 16, color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Space style={{ width: "100%" }}>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => setShowCashIn(true)}
              >
                Cash In
              </Button>
              <Button
                icon={<MinusCircleOutlined />}
                onClick={() => setShowCashOut(true)}
              >
                Cash Out
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setShowClose(true)}
              >
                Close Drawer
              </Button>
            </Space>

            {/* Cash In Form */}
            {showCashIn && (
              <Card size="small" title="Add Cash In">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <InputNumber
                    placeholder="Amount"
                    style={{ width: "100%" }}
                    value={cashInAmount}
                    onChange={(value) => setCashInAmount(value || 0)}
                    min={0}
                    formatter={(value) =>
                      `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
                  />
                  <Input
                    placeholder="Description"
                    value={cashInDescription}
                    onChange={(e) => setCashInDescription(e.target.value)}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={handleAddCashIn}
                      loading={cashInLoading}
                    >
                      Add
                    </Button>
                    <Button onClick={() => setShowCashIn(false)}>Cancel</Button>
                  </Space>
                </Space>
              </Card>
            )}

            {/* Cash Out Form */}
            {showCashOut && (
              <Card size="small" title="Add Cash Out">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <InputNumber
                    placeholder="Amount"
                    style={{ width: "100%" }}
                    value={cashOutAmount}
                    onChange={(value) => setCashOutAmount(value || 0)}
                    min={0}
                    formatter={(value) =>
                      `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
                  />
                  <Input
                    placeholder="Description"
                    value={cashOutDescription}
                    onChange={(e) => setCashOutDescription(e.target.value)}
                  />
                  <Space>
                    <Button
                      type="primary"
                      danger
                      onClick={handleAddCashOut}
                      loading={cashOutLoading}
                    >
                      Add
                    </Button>
                    <Button onClick={() => setShowCashOut(false)}>Cancel</Button>
                  </Space>
                </Space>
              </Card>
            )}

            {/* Close Drawer Form */}
            {showClose && (
              <Card size="small" title="Close Cash Drawer">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Typography.Text>
                    Expected Balance: <strong>{pesoFormatter(currentDrawer.currentBalance)}</strong>
                  </Typography.Text>
                  <InputNumber
                    placeholder="Actual Closing Balance"
                    style={{ width: "100%" }}
                    value={closingBalance}
                    onChange={(value) => setClosingBalance(value || 0)}
                    min={0}
                    formatter={(value) =>
                      `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
                  />
                  {closingBalance > 0 && (
                    <Typography.Text
                      type={closingBalance === currentDrawer.currentBalance ? "success" : "warning"}
                    >
                      Difference: {pesoFormatter(closingBalance - currentDrawer.currentBalance)}
                    </Typography.Text>
                  )}
                  <Space>
                    <Button
                      type="primary"
                      danger
                      onClick={handleCloseDrawer}
                      loading={closeLoading}
                    >
                      Close Drawer
                    </Button>
                    <Button onClick={() => setShowClose(false)}>Cancel</Button>
                  </Space>
                </Space>
              </Card>
            )}

            <Divider />

            {/* Transaction History */}
            <div>
              <Typography.Title level={5}>Transaction History</Typography.Title>
              <List
                size="small"
                dataSource={currentDrawer.transactions}
                renderItem={(transaction: any) => (
                  <List.Item>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space>
                        <Tag color={getTransactionColor(transaction.type)}>
                          {transaction.type.replace("_", " ")}
                        </Tag>
                        <Typography.Text>{transaction.description}</Typography.Text>
                      </Space>
                      <Typography.Text strong>
                        {transaction.type === "CASH_OUT" ? "-" : "+"}
                        {pesoFormatter(transaction.amount)}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
                style={{ maxHeight: 200, overflow: "auto" }}
              />
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default CashDrawerModal;
