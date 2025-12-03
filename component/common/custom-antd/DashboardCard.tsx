import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { Card, Flex, Statistic, Typography } from "antd";
import { pesoFormatter } from "@/utils/helper";

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
	const isNegative = (percentage ?? 0) < 0;
	const showPercentage = percentage !== undefined && percentage !== null && percentage !== 0;

	return (
		<Card variant="outlined" style={{ borderWidth: 1.5 }}>
			<Flex justify="space-between" align="flex-start">
				<Statistic
					title={title}
					value={
						title === "Total Items Sold"
							? `${(value ?? 0).toString()}`
							: `₱${value ?? 0}`
					}
					precision={title === "Total Items Sold" ? 0 : 2}
					valueStyle={{ fontSize: '24px' }}
				/>
				{showPercentage && (
					<Flex align="center" gap={4}>
						{isNegative ? (
							<ArrowDownOutlined
								style={{
									color: "red",
									fontSize: 16,
								}}
							/>
						) : (
							<ArrowUpOutlined
								style={{
									color: "green",
									fontSize: 16,
								}}
							/>
						)}
						<Typography.Text
							style={{
								color: isNegative ? "red" : "green",
								fontWeight: 500,
								fontSize: '14px'
							}}
						>
							{Math.abs(percentage).toFixed(1)}%
						</Typography.Text>
					</Flex>
				)}
			</Flex>
		</Card>
	);
};

export default StatisticCard;
