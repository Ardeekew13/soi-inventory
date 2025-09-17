import { Card, Flex, Typography } from "antd";

interface CardInfoProps {
	title: string;
	value: string;
	color: string;
}

const CardInfo = (props: CardInfoProps) => {
	const { title, value, color } = props;
	return (
		<div>
			<Card
				style={{ backgroundColor: color, width: "100%" }}
				styles={{ body: { width: "100%" } }}
			>
				<Flex justify="center" vertical>
					<Typography.Title level={5}>{title}</Typography.Title>
					<Typography.Title level={4}>{value}</Typography.Title>
				</Flex>
			</Card>
		</div>
	);
};

export default CardInfo;
