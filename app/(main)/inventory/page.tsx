"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import ItemListTable from "@/component/inventory/itemListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Item, Query } from "@/generated/graphql";
import { GET_ITEMS } from "@/graphql/inventory/items";
import { useModal } from "@/hooks/useModal";
import { useQuery } from "@apollo/client";
import { Button, message, Skeleton, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";

const Inventory = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();

	const { data, loading, refetch } = useQuery<Query>(GET_ITEMS, {
		variables: {
			search,
		},
	});

	const tableProps = useMemo(
		() => ({
			data: data?.items ?? ([] as Item[]),
			loading,
			refetch,
			openModal,
			messageApi,
			setSearch,
			search
		}),
		[data, loading, refetch, openModal, messageApi, setSearch, search]
	);

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
					title="Inventory"
					subTitle="Manage your available stock here. You can view, add, edit, or delete items to keep your inventory up to date"
				/>
			}
			extra={
				<Button key="1" type="primary" onClick={() => openModal()}>
					Add Item
				</Button>
			}
		>
			<Tabs
				defaultActiveKey="1"
				size="small"
				items={[
					{
						label: "Items",
						key: "1",
						children: <ItemListTable {...tableProps} />,
					},
				]}
			/>

			{contextHolder}
			<AddItemModal
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
export default Inventory;
