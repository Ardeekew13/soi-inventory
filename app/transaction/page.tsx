/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import ViewTransactionModal from "@/component/transaction/dialog/viewTransactionModal";
import TransactionListTable from "@/component/transaction/transactionListTable";
import { Query, Sale } from "@/generated/graphql";
import { GET_SALES } from "@/graphql/inventory/transactions";
import { useModal } from "@/hooks/useModal";
import { useQuery } from "@apollo/client";
import { message, Skeleton, Tabs } from "antd";
import { useMemo, useState } from "react";

const Transactions = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");

	const { data, loading, refetch } = useQuery<Query>(GET_SALES);

	const tableProps = useMemo(
		() => ({
			data: data?.sales ?? ([] as Sale[]),
			loading,
			refetch,
			openModal,
			messageApi,
			setSearch,
		}),
		[data, loading, refetch, openModal, messageApi, setSearch]
	);

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
