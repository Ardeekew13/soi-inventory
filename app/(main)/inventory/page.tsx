"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddItemModal from "@/component/inventory/dialog/addItemDialog";
import ItemListTable from "@/component/inventory/itemListTable";
import InactiveItemListTable from "@/component/inventory/inactiveItemListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Item, ItemsResponse, Query } from "@/generated/graphql";
import { GET_ITEMS, GET_INACTIVE_ITEMS } from "@/graphql/inventory/items";
import { useModal } from "@/hooks/useModal";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { exportInventoryToExcel } from "@/utils/export-inventory";
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

	const [inactiveState, setInactiveState] = useState<CommonStateFilterI>({
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

	const { data: inactiveData, loading: inactiveLoading, refetch: refetchInactive } = useQuery<Query>(GET_INACTIVE_ITEMS, {
		variables: {
			search: inactiveState?.search,
			limit: inactiveState?.limit,
			skip: ((inactiveState.page ?? 1) - 1) * (inactiveState.limit ?? 10),
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

	const inactiveTableProps = useMemo(
		() => ({
			data: (inactiveData as any)?.inactiveItemsList as ItemsResponse,
			loading: inactiveLoading,
			refetch: refetchInactive,
			openModal,
			messageApi,
			state: inactiveState,
			setState: setInactiveState,
			userPermissions,
			userRole,
		}),
		[inactiveData, inactiveLoading, refetchInactive, openModal, messageApi, inactiveState, setInactiveState, userPermissions, userRole]
	);

	useEffect(() => {
		if (triggerRefetch) {
			refetch();
			refetchInactive();
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
				<>
					{(userRole === 'SUPER_ADMIN' || userPermissions?.inventory?.includes('view')) && (
						<Button 
							key="export" 
							onClick={() => exportInventoryToExcel(data?.itemsList?.items ?? [])}
							style={{ marginRight: 8 }}
						>
							Export to Excel
						</Button>
					)}
					{(userRole === 'SUPER_ADMIN' || userPermissions?.inventory?.includes('addEdit')) && (
						<Button key="add" type="primary" onClick={() => openModal()}>
							Add Item
						</Button>
					)}
				</>
			}
		>
		<Tabs
			defaultActiveKey="1"
			size="small"
			items={[
				{
					label: "Active Items",
					key: "1",
					children: <ItemListTable {...tableProps} />,
				},
				{
					label: "Inactive Items",
					key: "2",
					children: <InactiveItemListTable {...inactiveTableProps} />,
				},
			]}
		/>			{contextHolder}
			<AddItemModal
				key={selectedRecord?._id}
				open={isModalOpen}
				onClose={closeModal}
				refetch={() => {
					refetch();
					refetchInactive();
				}}
				messageApi={messageApi}
				record={selectedRecord}
			/>
		</PageLayout>
	);
};
export default Inventory;
