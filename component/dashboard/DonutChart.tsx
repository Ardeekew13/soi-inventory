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
const DonutChart = (props: IProps) => {
	const { data } = props;
	const topProductSold = data?.topProductSold ?? [];

	const options: ApexOptions = {
		chart: {
			width: 400,
			type: "donut",
		},
		labels: topProductSold.map((item) => item.name),
		colors: [
			"#1E3A8A", // Deep navy (brand)
			"#2563EB", // Royal blue
			"#3B82F6", // Tailwind blue
			"#60A5FA", // Sky blue
			"#93C5FD", // Light ice blue
		],
		legend: {
			position: "right",
			horizontalAlign: "center",

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
	};

	const series = topProductSold.map((item) => item.quantity);
	return (
		<Suspense
			fallback={
				<div>
					<Skeleton active />
				</div>
			}
		>
			<ReactApexChart
				options={options}
				series={series}
				type="donut"
				width={500}
			/>
		</Suspense>
	);
};

export default DonutChart;
