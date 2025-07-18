"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import ViewTransactionModal from "@/component/transaction/dialog/viewTransactionModal";
import TransactionListTable from "@/component/transaction/transactionListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Query, Sale } from "@/generated/graphql";
import { GET_SALES } from "@/graphql/inventory/transactions";
import { useModal } from "@/hooks/useModal";
import { exportToExcel } from "@/utils/export-report";
import { useQuery } from "@apollo/client";
import { Button, message, Skeleton, Tabs } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const Transactions = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();

	const { data, loading, refetch } = useQuery<Query>(GET_SALES, {
		variables: {
			search,
		},
	});

	const tableProps = useMemo(
		() => ({
			data: data?.sales ?? ([] as Sale[]),
			loading,
			refetch,
			openModal,
			messageApi,
			setSearch,
			search,
		}),
		[data, loading, refetch, openModal, messageApi, setSearch, search]
	);

	const formattedData = data?.sales.map((sale) => {
		const itemList = sale.saleItems
			.map((i) => `${i.product.name} (x${i.quantity}, ${i.priceAtSale})`)
			.join(", ");
		return {
			"Transaction Date": dayjs(sale.createdAt).format("YYYY-MM-DD HH:mm"),
			"Order No.": sale.orderNo,
			"Items Sold": itemList,
			"Cost of Goods": `₱${sale.costOfGoods.toFixed(2)}`,
			"Gross Profit": `₱${sale.grossProfit.toFixed(2)}`,
			"Total Amount": `₱${sale.totalAmount.toFixed(2)}`,
		};
	});

	useEffect(() => {
		if (triggerRefetch) {
			refetch();
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
			extra={
				<Button
					type="primary"
					onClick={() => exportToExcel(formattedData ?? [], "transactions")}
				>
					Export to xlsx
				</Button>
			}
		>
			<Tabs
				defaultActiveKey="1"
				size="small"
				items={[
					{
						label: "Transaction List",
						key: "1",
						children: <TransactionListTable {...tableProps} />,
					},
				]}
			/>

			{contextHolder}
			<ViewTransactionModal
				key={selectedRecord?.id}
				open={isModalOpen}
				onClose={closeModal}
				refetch={refetch}
				messageApi={messageApi}
				record={selectedRecord}
			/>
		</PageLayout>
	);
};
export default Transactions;
