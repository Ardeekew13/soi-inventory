import { Card, CardProps } from "antd";

const CustomCard = (props: CardProps) => {
	return (
		<Card
			style={{
				boxShadow:
					"0 6px 16px -8px #00000014, 0 9px 28px #0000000d, 0 12px 48px 16px #00000008",
				...(props?.style ?? {}),
			}}
			{...props}
		/>
	);
};

export default CustomCard;
