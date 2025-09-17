"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import ItemListTable from "@/component/inventory/itemListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { useModal } from "@/hooks/useModal";
import { supabase } from "@/lib/supabase-client";
import { Button, message, Skeleton, Tabs } from "antd";
import { useEffect, useMemo, useState } from "react";

const Inventory = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();
	const [loading, setLoading] = useState<boolean>(true);
	const [data, setData] = useState<any[]>([]);

	const fetchItems = async () => {
		setLoading(true);

		let query = supabase
			.from("items")
			.select("*")
			.order("created_at", { ascending: false });

		// if search string provided
		if (search) {
			query = query.ilike("name", `%${search}%`);
		}

		const { data: items, error } = await supabase.rpc("get_items", {
			search: search ?? undefined,
		});

		if (error) {
			messageApi.error("Failed to fetch items: " + error.message);
			setData([]);
		} else {
			setData(items ?? []);
		}

		setLoading(false);
	};

	useEffect(() => {
		fetchItems();
	}, [search]);

	// Trigger refresh if global refetch flag is set
	useEffect(() => {
		if (triggerRefetch) {
			fetchItems();
			setTriggerRefetch(false);
		}
	}, [triggerRefetch]);

	const tableProps = useMemo(
		() => ({
			data,
			loading,
			refetch: fetchItems,
			openModal,
			messageApi,
			setSearch,
			search,
		}),
		[data, loading, openModal, messageApi, search]
	);

	useEffect(() => {
		if (triggerRefetch) {
			fetchItems();
			setTriggerRefetch(false);
		}
	}, [triggerRefetch]);

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
				refetch={fetchItems}
				messageApi={messageApi}
				record={selectedRecord}
			/>
		</PageLayout>
	);
};
export default Inventory;
