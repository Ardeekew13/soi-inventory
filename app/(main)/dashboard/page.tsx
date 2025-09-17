"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import StatisticCard from "@/component/common/custom-antd/DashboardCard";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import DonutChart from "@/component/dashboard/DonutChart";
import LineChart from "@/component/dashboard/LineChart";
import { supabase } from "@/lib/supabase-client";
import { SaleReportGroup } from "@/lib/supabase.types";
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
import { useEffect, useState } from "react";

export default function Home() {
	const [loading, setLoading] = useState(true);
	const [report, setReport] = useState<any>(null);

	const [startDate, setStartDate] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<string | null>(null);
	const [year, setYear] = useState<string | null>(dayjs().year().toString());
	const [mode, setMode] = useState("All");

	async function fetchReports() {
		setLoading(true);
		const { data, error } = await supabase.rpc("get_sale_reports", {
			start_date: startDate,
			end_date: endDate,
			p_year: year,
		});
		if (error) {
			console.error("Error fetching report:", error);
			setReport(null);
		} else {
			setReport((data as unknown as SaleReportGroup) ?? null);
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchReports();
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

	if (loading) return <Skeleton active />;

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
						size="middle"
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
						value={report?.grossProfit ?? 0}
						percentage={report?.grossProfitPercentage ?? 0}
					/>
				</Col>
				<Col lg={6} sm={24} xs={24}>
					<StatisticCard
						title="Gross Sales"
						value={report?.totalAmountSales ?? 0}
						percentage={report?.totalSalesPercentage ?? 0}
					/>
				</Col>
				<Col lg={6} sm={24} xs={24}>
					<StatisticCard
						title="Cost of Goods"
						value={report?.totalCostOfGoods ?? 0}
						percentage={report?.totalCostPercentage ?? 0}
					/>
				</Col>
				<Col lg={6} sm={24} xs={24}>
					<StatisticCard
						title="Total Items Sold"
						value={report?.totalItemsSold ?? 0}
					/>
				</Col>
			</Row>

			<Row style={{ marginTop: 20 }} gutter={[16, 16]}>
				<Col lg={14} sm={24} xs={24}>
					<Card style={{ height: 400 }}>
						<Flex justify="end">
							<Select
								value={year}
								onChange={(value) => setYear(value.toString())}
							>
								{report?.availableYears?.map((y: number) => (
									<Select.Option key={y} value={y}>
										{y}
									</Select.Option>
								))}
							</Select>
						</Flex>
						{report && <LineChart data={report} />}
					</Card>
				</Col>

				<Col lg={10} sm={24} xs={24}>
					<Card style={{ height: 400 }}>
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
							{report && <DonutChart data={report} />}
						</div>
					</Card>
				</Col>
			</Row>
		</PageLayout>
	);
}
