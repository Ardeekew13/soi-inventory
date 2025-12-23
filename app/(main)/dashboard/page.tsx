/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import StatisticCard from "@/component/common/custom-antd/DashboardCard";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import DonutChart from "@/component/dashboard/DonutChart";
import LineChart from "@/component/dashboard/LineChart";
import OfflineSyncStatus from "@/component/common/OfflineSyncStatus";
import NoPermissionPage from "@/component/common/NoPermissionPage";
import { Query } from "@/generated/graphql";
import { GET_SALE_REPORTS } from "@/graphql/inventory/dashboard";
import { useQuery } from "@apollo/client";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import {
  Card,
  Col,
  Flex,
  Row,
  Segmented,
  Select,
  Skeleton,
  Typography,
  DatePicker,
  Button,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function Home() {
  // Permission guard - check if user has access but don't auto-redirect
  const { loading: permissionLoading, hasAccess } = usePermissionGuard({
    module: "dashboard",
    action: "view",
    redirectTo: "", // Empty string means don't redirect, just check permission
  });

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [grossProfit, setGrossProfit] = useState<number | null>(0);
  const [totalAmountSales, setTotalAmountSales] = useState<number | null>(0);
  const [totalCostOfGoods, setTotalCostOfGoods] = useState<number | null>(0);
  const [totalItemsSold, setTotalItemsSold] = useState<number | null>(0);
  const [totalSalesPercentage, setTotalSalesPercentage] = useState<
    number | null
  >(0);
  const [totalCostPercentage, setTotalCostPercentage] = useState<number | null>(
    0
  );
  const [grossProfitPercentage, setGrossProfitPercentage] = useState<
    number | null
  >(0);
  const [numberOfTransactions, setNumberOfTransactions] = useState<number | null>(0);
  const [totalDiscounts, setTotalDiscounts] = useState<number | null>(0);
  const [totalNetSales, setTotalNetSales] = useState<number | null>(0);
  const [year, setYear] = useState<string | null>(dayjs().year().toString());
  const [availableYears, setAvailableYears] = useState<number[] | null>(null);
  const { data, loading, refetch } = useQuery<Query>(GET_SALE_REPORTS, {
    variables: {
      startDate,
      endDate,
      year,
    },
    fetchPolicy: "cache-and-network", // Use cache first, then network
  });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [mode, setMode] = useState("All");

  useEffect(() => {
    if (data) {
      setGrossProfit(data.saleReport?.grossProfit ?? 0);
      setTotalAmountSales(data.saleReport?.totalAmountSales ?? 0);
      setTotalCostOfGoods(data.saleReport?.totalCostOfGoods ?? 0);
      setTotalItemsSold(data.saleReport?.totalItemsSold ?? 0);
      setTotalSalesPercentage(data.saleReport?.totalSalesPercentage ?? 0);
      setTotalCostPercentage(data.saleReport?.totalCostPercentage ?? 0);
      setGrossProfitPercentage(data.saleReport?.grossProfitPercentage ?? 0);
      setAvailableYears(data.saleReport?.availableYears ?? null);
      setNumberOfTransactions(data.saleReport?.numberOfTransactions ?? 0);
      setTotalDiscounts(data.saleReport?.totalDiscounts ?? 0);
      setTotalNetSales(data.saleReport?.totalNetSales ?? 0);
    }
  }, [data]);

  // Removed the problematic useEffect that was causing re-renders
  // Apollo Client will automatically refetch when variables change

  const dateRange = (value: string) => {
    const today = dayjs();
    let startDate: dayjs.Dayjs | null;
    let endDate: dayjs.Dayjs | null;

    switch (value) {
      case "Daily":
        startDate = today.startOf("day");
        endDate = today.endOf("day");
        break;
      case "Weekly":
        startDate = today.startOf("week");
        endDate = today.endOf("week");
        break;
      case "Monthly":
        startDate = today.startOf("month");
        endDate = today.endOf("month");
        break;
      case "Yearly":
        startDate = today.startOf("year");
        endDate = today.endOf("year");
        break;
      case "All":
      default:
        startDate = null;
        endDate = null;
    }

    setStartDate(startDate ? startDate.toISOString() : null);
    setEndDate(endDate ? endDate.toISOString() : null);
  };

  // Show loading while checking permissions or loading data
  if (permissionLoading || loading) {
    return <Skeleton active />;
  }

  // Show no permission page if user doesn't have access
  if (!hasAccess) {
    return <NoPermissionPage moduleName="Dashboard" />;
  }

  return (
    // <>adasd</>
    <PageLayout
      title={
        <CommonPageTitle
          title="Dashboard"
          subTitle="Your Complete Transaction Record"
        />
      }
      tabBarExtraContent={
        <Flex justify="end" gap={8} style={{ marginBottom: 20 }}>
          <DatePicker.RangePicker
            size={isMobile ? "small" : "middle"}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setStartDate(dates[0].startOf("day").toISOString());
                setEndDate(dates[1].endOf("day").toISOString());
                setMode("Custom");
              }
            }}
            format="YYYY-MM-DD"
          />
          <Segmented<string>
            size={isMobile ? "small" : "middle"}
            options={["All", "Daily", "Weekly", "Monthly", "Yearly"]}
            value={mode}
            onChange={(value) => {
              dateRange(value);
              setMode(value);
            }}
          />
        </Flex>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <OfflineSyncStatus />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard
            title="Gross Profit"
            value={grossProfit}
            percentage={grossProfitPercentage ?? 0}
          />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard
            title="Gross Sales"
            value={totalAmountSales}
            percentage={totalSalesPercentage ?? 0}
          />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard
            title="Cost of Goods"
            value={totalCostOfGoods}
            percentage={totalCostPercentage ?? 0}
          />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard title="Total Items Sold" value={totalItemsSold} />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard title="Total Net Sales" value={totalNetSales} />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard title="No. of Transactions" value={numberOfTransactions} />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard title="No. of Items" value={totalItemsSold} />
        </Col>
        <Col lg={6} sm={24} xs={24}>
          <StatisticCard title="Total Discounts" value={totalDiscounts} />
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }} gutter={[16, 16]}>
        <Col lg={14} sm={24} xs={24}>
          <Card
            style={{
              height: 400,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            styles={{
              body: { flex: 1, display: "flex", flexDirection: "column" },
            }}
          >
            <Flex justify="end">
              <Select
                value={year}
                onChange={(value) => {
                  setYear(value.toString());
                }}
              >
                {_.isArray(availableYears)
                  ? availableYears.map((year: number) => (
                      <Select.Option key={year} value={year}>
                        {year}
                      </Select.Option>
                    ))
                  : null}
              </Select>
            </Flex>

            {data?.saleReport && <LineChart data={data.saleReport} />}
          </Card>
        </Col>
        <Col lg={10} sm={24} xs={24}>
          <Card
            style={{
              height: 400,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            styles={{
              body: { flex: 1, display: "flex", flexDirection: "column" },
            }}
          >
            <Typography.Title level={4} style={{ textAlign: "center" }}>
              Top Product Sold
            </Typography.Title>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data?.saleReport && <DonutChart data={data?.saleReport} />}
            </div>
          </Card>
        </Col>
      </Row>

      {/* New Reports Section */}
      <Row style={{ marginTop: 20 }} gutter={[16, 16]}>
        {/* Sales by Payment Method */}
        <Col lg={8} md={12} xs={24}>
          <Card title="Sales by Payment Method" style={{ height: 350 }}>
            {data?.saleReport?.salesByPaymentMethod && data.saleReport.salesByPaymentMethod.length > 0 ? (
              <div>
                {data.saleReport.salesByPaymentMethod.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.paymentMethod}</span>
                    <span style={{ color: "#52c41a", fontWeight: 600 }}>
                      ₱{item.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                No payment data
              </div>
            )}
          </Card>
        </Col>

        {/* Refunds */}
        <Col lg={8} md={12} xs={24}>
          <Card title="Refunds" style={{ height: 350 }}>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Typography.Title level={2} style={{ margin: 0, color: "#ff4d4f" }}>
                ₱{data?.saleReport?.totalRefunds?.toFixed(2) || "0.00"}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                Total Refunded
              </Typography.Text>
            </div>
            <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #f0f0f0" }}>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {data?.saleReport?.numberOfRefunds || 0}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                Number of Refunds
              </Typography.Text>
            </div>
          </Card>
        </Col>

        {/* Sales by Cashier */}
        <Col lg={8} md={12} xs={24}>
          <Card title="Sales by Cashier" style={{ height: 350 }}>
            {data?.saleReport?.salesByCashier && data.saleReport.salesByCashier.length > 0 ? (
              <div>
                {data.saleReport.salesByCashier.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.cashierName}</span>
                    <span style={{ color: "#722ed1", fontWeight: 600 }}>
                      ₱{item.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                No cashier data
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}
