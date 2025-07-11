import { PageContainer, PageContainerProps } from "@ant-design/pro-components";

interface PageLayoutProps extends PageContainerProps {}

const PageLayout = (props: PageLayoutProps) => {
	return (
		<div
			style={{
				flex: 1,
				backgroundColor: "#FFFFFF",
				margin: 20,
				borderRadius: 10,
				paddingTop: 20,
			}}
		>
			<PageContainer
				token={{ paddingBlockPageContainerContent: 0 }}
				style={{ flex: 1 }}
				{...props}
			/>
		</div>
	);
};

export default PageLayout;
