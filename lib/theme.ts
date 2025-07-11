import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
	token: {
		colorPrimary: "#1E3A8A",
		colorInfo: "#1E3A8A",
	},
	components: {
		Layout: {
			headerBg: "#FFFFFF",
			colorBgBase: "#FFFFFF",
			colorBgContainer: "#FFFFFF",
			colorText: "rgba(162, 159, 159, 0.15)",
		},
		Menu: {
			itemSelectedColor: "#FFFFFF",
			itemSelectedBg: "#FFFFF",
			itemHoverColor: "#FFFFFF",
			itemBg: "#FFFFFF",
			itemColor: "#FFFFF",
		},
	},
};
