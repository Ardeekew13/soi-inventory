"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import AddProductModal from "@/component/product/dialog/addProductDialog";
import ProductListTable from "@/component/product/productListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { useModal } from "@/hooks/useModal";
import { supabase } from "@/lib/supabase-client";
import type { Product } from "@/lib/supabase.types";
import { Button, message, Skeleton, Tabs } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

const Product = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
	const [search, setSearch] = useState("");
	const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();
	const [loading, setLoading] = useState<boolean>(false);
	const [products, setProducts] = useState<Product[]>([]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		const { data, error } = await supabase.rpc("get_products", {
			search: search || null,
		});
		if (error) {
			messageApi.error("Failed to load products");
			setProducts([]);
		} else {
			setProducts(data ?? []);
		}
		setLoading(false);
	}, [search, messageApi]);

	// Trigger fetch
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	// Refetch on trigger
	useEffect(() => {
		if (triggerRefetch) {
			fetchProducts();
			setTriggerRefetch(false);
		}
	}, [triggerRefetch, fetchProducts, setTriggerRefetch]);

	const tableProps = useMemo(
		() => ({
			data: products ?? ([] as Product[]),
			loading,
			refetch: fetchProducts,
			openModal,
			messageApi,
			setSearch,
			search,
		}),
		[products, loading, fetchProducts, openModal, messageApi, setSearch, search]
	);
	useEffect(() => {
		if (triggerRefetch) {
			fetchProducts();
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
				refetch={fetchProducts}
				messageApi={messageApi}
				record={selectedRecord}
			/>
		</PageLayout>
	);
};
export default Product;
