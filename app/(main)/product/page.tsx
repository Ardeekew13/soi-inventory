"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddProductModal from "@/component/product/dialog/addProductDialog";
import ProductListTable from "@/component/product/productListTable";
import type { Product, Query } from "@/generated/graphql";
import { GET_PRODUCTS } from "@/graphql/inventory/products";
import { useModal } from "@/hooks/useModal";
import { useQuery } from "@apollo/client";
import { Button, message, Tabs } from "antd";
import { useCallback, useMemo, useState } from "react";

const Product = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");

	const { data, loading, refetch } = useQuery<Query>(GET_PRODUCTS, {
		variables: {
			search,
		},
	});

	const handleRefetch = useCallback(refetch, [refetch]);

	const tableProps = useMemo(
		() => ({
			data: data?.products ?? ([] as Product[]),
			loading,
			refetch: handleRefetch,
			openModal,
			messageApi,
			setSearch,
		}),
		[data, loading, handleRefetch, openModal, messageApi, setSearch]
	);

	return (
		<PageLayout
			title={
				<CommonPageTitle
					title="Product"
					subTitle="Manage your sellable products here. You can add, edit, or delete items to keep your product list up to date."
				/>
			}
			extra={[
				<Button key="1" type="primary" onClick={() => openModal()}>
					Add Product
				</Button>,
			]}
		>
			<Tabs
				defaultActiveKey="1"
				size="small"
				items={[
					{
						label: "Product",
						key: "1",
						children: <ProductListTable {...tableProps} />,
					},
				]}
			/>
			{contextHolder}
			<AddProductModal
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
export default Product;
