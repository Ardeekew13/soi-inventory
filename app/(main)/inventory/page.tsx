"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import ItemListTable from "@/component/inventory/itemListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Item, ItemsResponse, Query } from "@/generated/graphql";
import { GET_ITEMS } from "@/graphql/inventory/items";
import { useModal } from "@/hooks/useModal";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { CommonStateFilterI } from "@/utility/filters";
import { useQuery } from "@apollo/client";
import { Button, message, Skeleton, Tabs } from "antd";
import { skip } from "node:test";
import { useEffect, useMemo, useState } from "react";

const Inventory = () => {
	// Permission guard - will redirect if no access
	const { loading: permissionLoading, userPermissions, userRole } = usePermissionGuard({
		module: "inventory",
		action: "view",
	});

	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();
	const [state, setState] = useState<CommonStateFilterI>({
		page: 1,
		limit: 10,
		search: "",
	});
	
	const { data, loading, refetch } = useQuery<Query>(GET_ITEMS, {
		variables: {
			search: state?.search,
			limit: state?.limit,
			skip: ((state.page ?? 1) - 1) * (state.limit ?? 10),
		},
		skip: permissionLoading, // Skip query while checking permissions
	});

	const tableProps = useMemo(
		() => ({
			data: data?.itemsList as ItemsResponse,
			loading,
			refetch,
			openModal,
			messageApi,
			state,
			setState,
			userPermissions,
			userRole,
		}),
		[data, loading, refetch, openModal, messageApi, state, setState, userPermissions, userRole]
	);

	useEffect(() => {
		if (triggerRefetch) {
			refetch();
			setTriggerRefetch(false);
		}
	});

	// Show loading while checking permissions or fetching data
	if (permissionLoading || loading) {
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
				(userRole === 'SUPER_ADMIN' || userPermissions?.inventory?.includes('addEdit')) && (
					<Button key="1" type="primary" onClick={() => openModal()}>
						Add Item
					</Button>
				)
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
				key={selectedRecord?._id}
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
