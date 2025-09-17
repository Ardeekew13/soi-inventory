"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import ViewTransactionModal from "@/component/transaction/dialog/viewTransactionModal";
import TransactionListTable from "@/component/transaction/transactionListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { useModal } from "@/hooks/useModal";
import { supabase } from "@/lib/supabase-client";
import { Sale } from "@/lib/supabase.types";
import { message, Skeleton, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";

const Transactions = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const [defaultTab, setDefaultTab] = useState<string>("transaction");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>([]);

	const fetchSales = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase.rpc("get_sales", {
				p_search: search || null,
				p_tab: defaultTab,
			});
			if (error) throw error;
			setData(data ?? []);
		} catch (error) {
			console.error("Error fetching sales:", error);
			messageApi.error("Failed to load transactions");
			setData([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchSales();
	}, [search, defaultTab]);

	useEffect(() => {
		if (triggerRefetch) {
			fetchSales();
			setTriggerRefetch(false);
		}
	}, [triggerRefetch, setTriggerRefetch]);

	console.log("variables", search, defaultTab);
	const tableProps = useMemo(
		() => ({
			data: data ?? ([] as Sale[]),
			loading,
			refetch: fetchSales,
			openModal,
			messageApi,
			setSearch,
			search,
		}),
		[data, loading, openModal, messageApi, setSearch, search]
	);

	useEffect(() => {
		if (triggerRefetch) {
			fetchSales();
			setTriggerRefetch(false);
		}
	});

	if (loading) {
		return <Skeleton active />;
	}

	return (
		<PageLayout
			title={
				<CommonPageTitle
					title="Transaction"
					subTitle="Your Complete Transaction Record"
				/>
			}
			/* extra={
				<Button
					type="primary"
					onClick={() => exportToExcel(formattedData ?? [], "transactions")}
				>
					Export to xlsx
				</Button>
			} */
		>
			<Tabs
				defaultActiveKey={defaultTab}
				onChange={(key) => setDefaultTab(key)}
				size="small"
				items={[
					{
						label: "Transaction List",
						key: "transaction",
						children: <TransactionListTable {...tableProps} />,
					},
					{
						label: "Voided Transaction",
						key: "voided",
						children: <TransactionListTable {...tableProps} />,
					},
				]}
			/>

			{contextHolder}
			<ViewTransactionModal
				key={selectedRecord?.id}
				open={isModalOpen}
				onClose={closeModal}
				refetch={fetchSales}
				messageApi={messageApi}
				record={selectedRecord}
			/>
		</PageLayout>
	);
};
export default Transactions;
