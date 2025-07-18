/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import StatisticCard from "@/component/common/custom-antd/DashboardCard";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import DonutChart from "@/component/dashboard/DonutChart";
import LineChart from "@/component/dashboard/LineChart";
import { Query } from "@/generated/graphql";
import { GET_SALE_REPORTS } from "@/graphql/inventory/dashboard";
import { useQuery } from "@apollo/client";
import {
	Card,
	Col,
	Flex,
	Row,
	Segmented,
	Select,
	Skeleton,
	Typography,
} from "antd";
import dayjs from "dayjs";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function Home() {
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
	const [year, setYear] = useState<string | null>(dayjs().year().toString());
	const [availableYears, setAvailableYears] = useState<number[] | null>(null);
	const { data, loading, refetch } = useQuery<Query>(GET_SALE_REPORTS, {
		variables: {
			startDate,
			endDate,
			year,
		},
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
		}
	}, [data]);

	useEffect(() => {
		if (!loading) {
			refetch({
				startDate,
				endDate,
				year,
			});
		}
	}, [startDate, endDate, year]);

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

	
	if (loading) {
		return <Skeleton active />;
	}

	return (
		<PageLayout
			title={
				<CommonPageTitle
					title="Dashboard"
					subTitle="Your Complete Transaction Record"
				/>
			}
			tabBarExtraContent={
				<Flex justify="end" style={{ marginBottom: 20 }}>
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
		</PageLayout>
	);
}
