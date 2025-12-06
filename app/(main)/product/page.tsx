"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddProductModal from "@/component/product/dialog/addProductDialog";
import ProductListTable from "@/component/product/productListTable";
import InactiveProductListTable from "@/component/product/inactiveProductListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import type { Product, Query } from "@/generated/graphql";
import { GET_PRODUCTS, GET_INACTIVE_PRODUCTS } from "@/graphql/inventory/products";
import { useModal } from "@/hooks/useModal";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { exportProductsToExcel } from "@/utils/export-products";
import { useQuery } from "@apollo/client";
import { Button, message, Skeleton, Tabs } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

const Product = () => {
	// Permission guard - will redirect if no access
	const { loading: permissionLoading, userPermissions, userRole } = usePermissionGuard({
		module: "product",
		action: "view",
	});

	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const [inactiveSearch, setInactiveSearch] = useState("");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();

	const { data, loading, refetch } = useQuery<Query>(GET_PRODUCTS, {
		variables: {
			search,
		},
		skip: permissionLoading, // Skip query while checking permissions
	});

	const { data: inactiveData, loading: inactiveLoading, refetch: refetchInactive } = useQuery<Query>(GET_INACTIVE_PRODUCTS, {
		variables: {
			search: inactiveSearch,
		},
		skip: permissionLoading, // Skip query while checking permissions
	});

	const handleRefetch = useCallback(refetch, [refetch]);
	const handleInactiveRefetch = useCallback(refetchInactive, [refetchInactive]);

	const tableProps = useMemo(
		() => ({
			data: data?.productsList?.products ?? ([] as any[]),
			loading,
			refetch: handleRefetch,
			openModal,
			messageApi,
			setSearch,
			search,
			userPermissions,
			userRole,
		}),
		[data, loading, handleRefetch, openModal, messageApi, setSearch, search, userPermissions, userRole]
	);

	const inactiveTableProps = useMemo(
		() => ({
			data: (inactiveData as any)?.inactiveProductsList?.products ?? ([] as any[]),
			loading: inactiveLoading,
			refetch: handleInactiveRefetch,
			openModal,
			messageApi,
			setSearch: setInactiveSearch,
			search: inactiveSearch,
			userPermissions,
			userRole,
		}),
		[inactiveData, inactiveLoading, handleInactiveRefetch, openModal, messageApi, setInactiveSearch, inactiveSearch, userPermissions, userRole]
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
					title="Product"
					subTitle="Manage your sellable products here. You can add, edit, or delete items to keep your product list up to date."
				/>
			}
			extra={
				<>
					{(userRole === 'SUPER_ADMIN' || userPermissions?.product?.includes('view')) && (
						<Button 
							key="export" 
							onClick={() => exportProductsToExcel(data?.productsList?.products ?? [])}
							style={{ marginRight: 8 }}
						>
							Export to Excel
						</Button>
					)}
					{(userRole === 'SUPER_ADMIN' || userPermissions?.product?.includes('addEdit')) && (
						<Button key="add" type="primary" onClick={() => openModal()}>
							Add Product
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
						label: "Active Products",
						key: "1",
						children: <ProductListTable {...tableProps} />,
					},
					{
						label: "Inactive Products",
						key: "2",
						children: <InactiveProductListTable {...inactiveTableProps} />,
					},
				]}
			/>
			{contextHolder}
			<AddProductModal
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
export default Product;
