"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import {
  ADD_CASH_IN,
  ADD_CASH_OUT,
  CLOSE_CASH_DRAWER,
  GET_CASH_DRAWER_HISTORY,
  GET_CURRENT_CASH_DRAWER,
  OPEN_CASH_DRAWER,
} from "@/graphql/cash-drawer/cash-drawer";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { pesoFormatter } from "@/utils/helper";
import {
  CloseCircleOutlined,
  DollarOutlined,
  HistoryOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const CashDrawerPage = () => {
  // Permission guard - will redirect if no access
  const { loading: permissionLoading, userPermissions } = usePermissionGuard({
    module: "cashDrawer",
    action: "view",
  });

  const [messageApi, contextHolder] = message.useMessage();

  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [closingBalance, setClosingBalance] = useState<number>(0);
  const [cashInAmount, setCashInAmount] = useState<number>(0);
  const [cashInDescription, setCashInDescription] = useState<string>("");
  const [cashOutAmount, setCashOutAmount] = useState<number>(0);
  const [cashOutDescription, setCashOutDescription] = useState<string>("");
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCashInModal, setShowCashInModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const { data, loading, refetch } = useQuery(GET_CURRENT_CASH_DRAWER, {
    skip: permissionLoading,
  });
  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useQuery(GET_CASH_DRAWER_HISTORY, {
    variables: { limit: 10 },
    skip: permissionLoading,
  });

  const currentDrawer = data?.currentCashDrawer;
  const drawerHistory = historyData?.cashDrawerHistory || [];

  // Refetch data when component mounts or becomes visible
  useEffect(() => {
    refetch();
    refetchHistory();
  }, [refetch, refetchHistory]);

  const [openDrawer, { loading: openLoading }] = useMutation(OPEN_CASH_DRAWER, {
    onCompleted: (data) => {
      if (data?.openCashDrawer?.success) {
        messageApi.success(data.openCashDrawer.message);
        setOpeningBalance(0);
        setShowOpenModal(false);
        refetch();
      }
    },
    onError: (error) => messageApi.error(error.message),
  });

  const [closeDrawer, { loading: closeLoading }] = useMutation(
    CLOSE_CASH_DRAWER,
    {
      onCompleted: (data) => {
        if (data?.closeCashDrawer?.success) {
          messageApi.success(data.closeCashDrawer.message);
          setClosingBalance(0);
          setShowCloseModal(false);
          refetch();
          refetchHistory();
        }
      },
      onError: (error) => messageApi.error(error.message),
    }
  );

  const [addCashIn, { loading: cashInLoading }] = useMutation(ADD_CASH_IN, {
    onCompleted: (data) => {
      if (data?.addCashIn?.success) {
        messageApi.success(data.addCashIn.message);
        setCashInAmount(0);
        setCashInDescription("");
        setShowCashInModal(false);
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
        setShowCashOutModal(false);
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
    addCashIn({
      variables: { amount: cashInAmount, description: cashInDescription },
    });
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
    addCashOut({
      variables: { amount: cashOutAmount, description: cashOutDescription },
    });
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

  const historyColumns = [
    {
      title: "Opened At",
      dataIndex: "openedAt",
      key: "openedAt",
      render: (date: string) =>
        dayjs(parseInt(date)).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "Closed At",
      dataIndex: "closedAt",
      key: "closedAt",
      render: (date: string) =>
        dayjs(parseInt(date)).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "Opened By",
      dataIndex: "openedBy",
      key: "openedBy",
    },
    {
      title: "Opening",
      dataIndex: "openingBalance",
      key: "openingBalance",
      render: (amount: number) => pesoFormatter(amount),
    },
    {
      title: "Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      render: (amount: number) => (
        <Typography.Text style={{ color: "#1890ff" }}>
          {pesoFormatter(amount)}
        </Typography.Text>
      ),
    },
    {
      title: "Cash In",
      dataIndex: "totalCashIn",
      key: "totalCashIn",
      render: (amount: number) => (
        <Typography.Text style={{ color: "#52c41a" }}>
          +{pesoFormatter(amount)}
        </Typography.Text>
      ),
    },
    {
      title: "Cash Out",
      dataIndex: "totalCashOut",
      key: "totalCashOut",
      render: (amount: number) => (
        <Typography.Text style={{ color: "#ff4d4f" }}>
          -{pesoFormatter(amount)}
        </Typography.Text>
      ),
    },
    {
      title: "Expected",
      dataIndex: "expectedBalance",
      key: "expectedBalance",
      render: (amount: number) => pesoFormatter(amount),
    },
    {
      title: "Actual",
      dataIndex: "closingBalance",
      key: "closingBalance",
      render: (amount: number) => pesoFormatter(amount),
    },
    {
      title: "Difference",
      key: "difference",
      render: (_: any, record: any) => {
        const diff = record.closingBalance - record.expectedBalance;
        return (
          <Typography.Text type={diff === 0 ? "success" : "warning"}>
            {pesoFormatter(diff)}
          </Typography.Text>
        );
      },
    },
  ];
  console.log("Current Drawer:", currentDrawer);
  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <CommonPageTitle title="Cash Drawer Management" />

      {!currentDrawer ? (
        // No drawer open
        <Card>
          <Space
            direction="vertical"
            align="center"
            style={{ width: "100%", padding: 40 }}
            size={24}
          >
            <DollarOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            <Typography.Title level={3}>No Cash Drawer Open</Typography.Title>
            <Typography.Text type="secondary">
              Start your shift by opening a new cash drawer
            </Typography.Text>
            <Button
              type="primary"
              size="large"
              icon={<DollarOutlined />}
              onClick={() => setShowOpenModal(true)}
            >
              Open Cash Drawer
            </Button>
          </Space>
        </Card>
      ) : (
        // Drawer is open
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {/* End of Shift Reminder */}
          <Alert
            message="Remember to Close Drawer"
            description="Don't forget to close your cash drawer at the end of your shift. Count the cash and record the final amount to maintain accurate records."
            type="warning"
            showIcon
            closable
            action={
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setShowCloseModal(true)}
              >
                Close Drawer Now
              </Button>
            }
          />

          {/* Summary Cards */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Current Balance"
                  value={currentDrawer.currentBalance}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ color: "#3f8600", fontSize: 32 }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Opened by: <strong>{currentDrawer.openedBy}</strong>
                </Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(parseInt(currentDrawer.openedAt)).format(
                    "MMM D, YYYY h:mm A"
                  )}
                </Typography.Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Cash In"
                  value={currentDrawer.totalCashIn}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ color: "#52c41a", fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Sales"
                  value={currentDrawer.totalSales}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Cash Out"
                  value={currentDrawer.totalCashOut}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ color: "#ff4d4f", fontSize: 24 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Payment Method Breakdown */}
          <Card title="Sales Breakdown by Payment Method">
            <Row gutter={12}>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#f0f9ff", borderColor: "#91d5ff" }}
                >
                  <Statistic
                    title="💵 Cash Sales"
                    value={currentDrawer.cashSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 18, color: "#0050b3" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}
                >
                  <Statistic
                    title="🏦 Bank Transfer"
                    value={currentDrawer.bankTransferSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 18, color: "#237804" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}
                >
                  <Statistic
                    title="💳 Card Sales"
                    value={currentDrawer.cardSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 18, color: "#ad6800" }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={12} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#fff1f0", borderColor: "#ffccc7" }}
                >
                  <Statistic
                    title="📝 Credit Sales"
                    value={currentDrawer.creditSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 18, color: "#a8071a" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  style={{ backgroundColor: "#f9f0ff", borderColor: "#d3adf7" }}
                >
                  <Statistic
                    title="📱 GCash Sales"
                    value={currentDrawer.gcashSales}
                    precision={2}
                    prefix="₱"
                    valueStyle={{ fontSize: 18, color: "#531dab" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Action Buttons */}
          <Card title="Actions">
            <Space size="middle">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setShowCashInModal(true)}
                size="large"
              >
                Add Cash In
              </Button>
              <Button
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => setShowCashOutModal(true)}
                size="large"
              >
                Add Cash Out
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setShowCloseModal(true)}
                size="large"
              >
                Close Drawer
              </Button>
            </Space>
          </Card>

          {/* Transaction History */}
          <Card title="Today's Transactions">
            <List
              dataSource={currentDrawer.transactions}
              renderItem={(transaction: any) => (
                <List.Item>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <Tag color={getTransactionColor(transaction.type)}>
                        {transaction.type.replace("_", " ")}
                      </Tag>
                      <div>
                        <Typography.Text>
                          {transaction.description}
                        </Typography.Text>
                        <br />
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {dayjs(parseInt(transaction.createdAt)).format(
                            "h:mm A"
                          )}
                        </Typography.Text>
                      </div>
                    </Space>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {transaction.type === "CASH_OUT" ? "-" : "+"}
                      {pesoFormatter(transaction.amount)}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Space>
      )}

      <Divider />

      {/* History Section */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Cash Drawer History</span>
          </Space>
        }
      >
        <Table
          columns={historyColumns}
          dataSource={drawerHistory}
          rowKey="_id"
          loading={historyLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Open Drawer Modal */}
      <Modal
        title="Open Cash Drawer"
        open={showOpenModal}
        onCancel={() => setShowOpenModal(false)}
        onOk={handleOpenDrawer}
        confirmLoading={openLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            Enter the opening balance for your shift:
          </Typography.Text>
          <InputNumber
            size="large"
            style={{ width: "100%" }}
            value={openingBalance}
            onChange={(value) => setOpeningBalance(value || 0)}
            min={0}
            formatter={(value) =>
              `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
          />
        </Space>
      </Modal>

      {/* Cash In Modal */}
      <Modal
        title="Add Cash In"
        open={showCashInModal}
        onCancel={() => setShowCashInModal(false)}
        onOk={handleAddCashIn}
        confirmLoading={cashInLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Typography.Text strong>Amount:</Typography.Text>
            <InputNumber
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              value={cashInAmount}
              onChange={(value) => setCashInAmount(value || 0)}
              min={0}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
            />
          </div>
          <div>
            <Typography.Text strong>Description:</Typography.Text>
            <Input
              size="large"
              style={{ marginTop: 8 }}
              placeholder="e.g., Additional float, Tips, etc."
              value={cashInDescription}
              onChange={(e) => setCashInDescription(e.target.value)}
            />
          </div>
        </Space>
      </Modal>

      {/* Cash Out Modal */}
      <Modal
        title="Add Cash Out"
        open={showCashOutModal}
        onCancel={() => setShowCashOutModal(false)}
        onOk={handleAddCashOut}
        confirmLoading={cashOutLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Typography.Text strong>Amount:</Typography.Text>
            <InputNumber
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              value={cashOutAmount}
              onChange={(value) => setCashOutAmount(value || 0)}
              min={0}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
            />
          </div>
          <div>
            <Typography.Text strong>Description:</Typography.Text>
            <Input
              size="large"
              style={{ marginTop: 8 }}
              placeholder="e.g., Bank deposit, Petty cash, etc."
              value={cashOutDescription}
              onChange={(e) => setCashOutDescription(e.target.value)}
            />
          </div>
        </Space>
      </Modal>

      {/* Close Drawer Modal */}
      <Modal
        title="Close Cash Drawer"
        open={showCloseModal}
        onCancel={() => setShowCloseModal(false)}
        onOk={handleCloseDrawer}
        confirmLoading={closeLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card size="small" style={{ backgroundColor: "#f0f2f5" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography.Text>Expected Balance:</Typography.Text>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {pesoFormatter(currentDrawer?.currentBalance || 0)}
                </Typography.Text>
              </div>
            </Space>
          </Card>

          <div>
            <Typography.Text strong>Actual Closing Balance:</Typography.Text>
            <InputNumber
              size="large"
              style={{ width: "100%", marginTop: 8 }}
              value={closingBalance}
              onChange={(value) => setClosingBalance(value || 0)}
              min={0}
              formatter={(value) =>
                `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\₱\s?|(,*)/g, ""))}
            />
          </div>

          {closingBalance > 0 && currentDrawer && (
            <Card
              size="small"
              style={{
                backgroundColor:
                  closingBalance === currentDrawer.currentBalance
                    ? "#f6ffed"
                    : "#fff7e6",
                borderColor:
                  closingBalance === currentDrawer.currentBalance
                    ? "#b7eb8f"
                    : "#ffd591",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography.Text strong>Difference:</Typography.Text>
                <Typography.Text
                  strong
                  type={
                    closingBalance === currentDrawer.currentBalance
                      ? "success"
                      : "warning"
                  }
                  style={{ fontSize: 16 }}
                >
                  {pesoFormatter(closingBalance - currentDrawer.currentBalance)}
                </Typography.Text>
              </div>
            </Card>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default CashDrawerPage;
