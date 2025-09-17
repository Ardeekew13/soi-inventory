"use client";
import CardInfo from "@/component/cash-drawer/card-info";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import { supabase } from "@/lib/supabase-client";
import { formatPeso, responsiveColumn6 } from "@/utils/helper";

import {
	Button,
	Card,
	Col,
	Flex,
	InputNumber,
	message,
	Row,
	Typography,
} from "antd";
import { useEffect, useState } from "react";

const page = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [startingCash, setStartingCash] = useState<number | null>(0);
	const userId = localStorage.getItem("userId");
	const [messageApi, contextHolder] = message.useMessage();
	const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);

	const handleSubmit = async () => {
		try {
			const { data, error } = await supabase.rpc("open_cash_drawer", {
				p_opening_amount: startingCash ?? 0,
				p_notes: null,
			});

			if (error) {
				messageApi.error(error.message);
				return;
			}

			if (data) {
				setIsEditing(false);
				messageApi.success("Cash drawer opened successfully");
				setIsCashDrawerOpen(true);
				setStartingCash(data.opening_amount);
			}
		} catch (err: any) {
			messageApi.error(err.message || "Failed to open cash drawer");
		}
	};

	useEffect(() => {
		const checkDrawer = async () => {
			const { data, error } = await supabase
				.from("cash_drawers")
				.select("*")
				.eq("opened_by_id", (await supabase.auth.getUser()).data.user?.id)
				.eq("status", "OPEN")
				.maybeSingle();

			if (data) {
				setStartingCash(data.opening_amount);
				setIsCashDrawerOpen(true);
			}
		};

		checkDrawer();
	}, []);
	console.log("isCashDrawerOpen", isCashDrawerOpen);
	return (
		<PageLayout
			title={
				<CommonPageTitle
					title="Cash Drawer"
					subTitle="Stay Accountable with Accurate Daily Cash Logs"
				/>
			}
		>
			{contextHolder}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<Card style={{ width: "100%" }}>
						<Flex justify="flex-start" align="center" vertical>
							<Typography.Title
								level={5}
								style={{ textAlign: "center", marginBottom: 4 }}
							>
								Starting Cash
							</Typography.Title>

							{isEditing ? (
								<>
									<InputNumber
										value={startingCash}
										onChange={(value) => setStartingCash(value ?? 0)}
										formatter={(value) =>
											`₱ ${
												value != null
													? value
															.toString()
															.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
													: "0"
											}`
										}
										parser={(value) => {
											const parsed = value?.replace(/[₱,\s]/g, "");
											return parsed ? parseFloat(parsed) : 0;
										}}
										style={{
											textAlign: "center",
											fontSize: "32px",
											fontWeight: 600,
											width: "100%",
										}}
									/>
									<Button
										onClick={handleSubmit}
										style={{ marginTop: 16 }}
										type="primary"
									>
										Open Cash Drawer
									</Button>
								</>
							) : (
								<Typography.Title
									level={1}
									onClick={() => setIsEditing(true)}
									style={{ textAlign: "center", marginTop: 0 }}
								>
									{formatPeso(startingCash)}
								</Typography.Title>
							)}
						</Flex>
					</Card>
				</Col>

				<Col span={12}>
					<Card style={{ width: "100%" }}>
						<Flex justify="flex-start" align="center" vertical>
							<Typography.Title
								level={5}
								style={{ textAlign: "center", marginBottom: 4 }}
							>
								Cash Sales
							</Typography.Title>

							<Typography.Title
								level={1}
								style={{ textAlign: "center", marginTop: 0 }}
							>
								₱124,000
							</Typography.Title>
						</Flex>
					</Card>
				</Col>
				<Col span={24} style={{ width: "100%" }}>
					<Row gutter={[16, 16]} style={{ width: "100%" }} align="stretch">
						<Col {...responsiveColumn6}>
							<CardInfo
								title="Bank Transfer Sales"
								value={"₱123,100"}
								color="#E6F0FF"
							/>
						</Col>
						<Col {...responsiveColumn6}>
							<CardInfo title="Card Sales" value={"₱123,100"} color="#E8F9F1" />
						</Col>
						<Col {...responsiveColumn6}>
							<CardInfo
								title="Credit Expenses"
								value={"₱123,100"}
								color="#FFF5E6"
							/>
						</Col>
						<Col {...responsiveColumn6}>
							<CardInfo
								title="G-Cash Sales"
								value={"₱123,100"}
								color="#F5F5F5"
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		</PageLayout>
	);
};

export default page;
