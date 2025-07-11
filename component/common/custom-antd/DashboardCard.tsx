import { ArrowUpOutlined } from "@ant-design/icons";
import { Card, Flex, Statistic, Typography } from "antd";

interface StatisticCardProps {
	title: string;
	value: number | null;
	percentage?: number;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
	title,
	value,
	percentage,
}) => {
	console.log("value", value);
	return (
		<Card variant="outlined" style={{ borderWidth: 1.5 }}>
			<Flex justify="space-between">
				<Statistic
					title={title}
					value={
						title === "Total Items Sold"
							? `${(value ?? 0).toString()}`
							: `₱${value ?? 0}`
					}
					precision={title === "Total Items Sold" ? 0 : 2}
				/>
				<Flex align="center" gap={6}>
					{" "}
					<ArrowUpOutlined
						style={{
							color: `${(percentage ?? 0) < 0 ? "red" : "green"}`,
							fontSize: 24,
						}}
					/>
					{percentage && (
						<Typography.Text style={{ color: "green" }}>
							{percentage?.toFixed(2) ?? 0}%
						</Typography.Text>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};

export default StatisticCard;
