import { Maybe, SaleReportGroup } from "@/generated/graphql";
import { monthLabels } from "@/utils/constant";
import { Skeleton } from "antd";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
	ssr: false,
});

interface IProps {
	data: Maybe<SaleReportGroup>;
}

const LineChart = (props: IProps) => {
	const { data } = props;
	const lineChartOptions: ApexOptions = {
		chart: {
			type: "line",
			height: 320,
			toolbar: { show: false },
			zoom: { enabled: false },
		},
		stroke: {
			curve: "smooth",
			width: 2,
		},
		xaxis: {
			categories: monthLabels,
			labels: {
				style: { fontSize: "12px", colors: "#666" },
			},
		},
		yaxis: {
			labels: {
				formatter: (val: number) => `${(val / 1000).toFixed(0)}k`,
				style: { fontSize: "12px", colors: "#666" },
			},
		},
		tooltip: {
			y: {
				formatter: (val: number) => `₱${val.toLocaleString()}`,
			},
		},
		legend: {
			position: "top",
			horizontalAlign: "left",
			labels: {
				colors: "#666",
			},
		},
		colors: ["#8884d8", "#82ca9d"],
	};

	const grossProfitData = new Array(12).fill(0);
	const totalSalesData = new Array(12).fill(0);

	if (data?.groupSales) {
		data?.groupSales.forEach((entry, index) => {
			// Use the index directly since groupSales is already ordered by month
			grossProfitData[index] = entry.grossProfit ?? 0;
			totalSalesData[index] = entry.totalAmountSales ?? 0;
		});
	}

	const lineChartSeries = [
		{ name: "Gross Profit", data: grossProfitData },
		{ name: "Total Sales", data: totalSalesData },
	];
	return (
		<Suspense
			fallback={
				<div>
					<Skeleton active />
				</div>
			}
		>
			<ReactApexChart
				options={lineChartOptions}
				series={lineChartSeries}
				type="line"
				height={320}
			/>
		</Suspense>
	);
};

export default LineChart;
