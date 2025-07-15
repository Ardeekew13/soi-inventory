"use client";
import { Maybe, SaleReportGroup } from "@/generated/graphql";
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

const DonutChart = ({ data }: IProps) => {
	const topProductSold = data?.topProductSold ?? [];

	const options: ApexOptions = {
		chart: {
			type: "donut",
			toolbar: {
				show: false,
			},
		},
		labels: topProductSold.map((item) => item.name),
		colors: ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
		legend: {
			position: "bottom",
			fontSize: "14px",
		},
		dataLabels: {
			enabled: true,
			formatter: (val: number) => `${val.toFixed(1)}%`,
		},
		tooltip: {
			y: {
				formatter: (val: number) => `${val} sold`,
			},
		},
		noData: {
			text: "No data available",
			align: "center",
			verticalAlign: "middle",
			style: {
				color: "#999",
				fontSize: "16px",
			},
		},
		responsive: [
			{
				breakpoint: 768,
				options: {
					chart: {
						width: "100%",
					},
					legend: {
						position: "bottom",
					},
				},
			},
		],
	};

	const series = topProductSold.map((item) => item.quantity);

	return (
		<Suspense fallback={<Skeleton active />}>
			<div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
				<ReactApexChart
					options={options}
					series={series}
					type="donut"
					width="100%"
				/>
			</div>
		</Suspense>
	);
};

export default DonutChart;
