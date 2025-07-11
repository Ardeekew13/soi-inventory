"use client";
import { Typography } from "antd";
import { Content } from "antd/es/layout/layout";

const { Title, Text } = Typography;

interface CommonPageTitleProps {
	title: string;
	subTitle?: string;
}

const CommonPageTitle = ({ title, subTitle }: CommonPageTitleProps) => {
	return (
		<Content>
			<Title level={2} style={{ marginBottom: 4 }}>
				{title}
			</Title>
			{subTitle && (
				<Text
					type="secondary"
					style={{
						display: "block",
						marginTop: 4,
						fontSize: "clamp(12px, 2.5vw, 16px)",
						wordBreak: "break-word",
						maxWidth: "100%",
					}}
				>
					{subTitle}
				</Text>
			)}
		</Content>
	);
};

export default CommonPageTitle;
