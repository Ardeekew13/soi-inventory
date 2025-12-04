"use client";
import { Mutation, Product } from "@/generated/graphql";
import { DELETE_PRODUCT } from "@/graphql/inventory/products";
import { pesoFormatter } from "@/utils/helper";
import { hasPermission } from "@/utils/permissions";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Input, Popconfirm, Space, Table } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { StyledDiv } from "../style";

interface IProps {
	data: Product[];
	loading: boolean;
	refetch: () => void;
	messageApi: MessageInstance;
	openModal: (record: Product) => void;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
	search: string;
	userPermissions?: Record<string, string[]>;
	userRole?: string;
}

const ProductListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch, search, userPermissions, userRole } =
		props;

	const [deleteProduct, { loading: deleteLoading }] = useMutation<Mutation>(
		DELETE_PRODUCT,
		{
			onCompleted: (data) => {
				if (data?.deleteProduct?.success) {
					messageApi.success(data?.deleteProduct?.message);
					refetch();
				} else {
					messageApi.error(data?.deleteItem?.message);
				}
			},
		}
	);

	const handleDelete = (id: string) => {
		deleteProduct({
			variables: {
				id,
			},
		});
	};

	const columns: TableProps<Product>["columns"] = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "80%",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			width: "10%",
			align: "right",
			render: (pricePerUnit: number) => pesoFormatter(pricePerUnit),
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			width: "10%",
			align: "center",
			fixed: "right",
			render: (_, record: Product) => {
				return (
					<Space
						style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
					>
						<Button type="link" size="small" onClick={() => openModal(record)}>
							View
						</Button>
						{(userRole === 'SUPER_ADMIN' || hasPermission(userPermissions, 'product', 'delete')) && (
							<Popconfirm
								title="Delete Item"
								description="Are you sure you want to delete this item?"
								onConfirm={() => handleDelete(record?._id)}
								okText="Delete"
								cancelText="Cancel"
							>
								<DeleteOutlined style={{ color: "red" }} />
							</Popconfirm>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<div className="w-full">
			<Input.Search
				placeholder="Search"
				onSearch={setSearch}
				enterButton
				allowClear
				defaultValue={search}
			/>
			<StyledDiv>
				<Table
					rowKey={(record: Product) => record?._id}
					columns={columns}
					loading={loading || deleteLoading}
					dataSource={data ?? ([] as Product[])}
					size="small"
					scroll={{ x: 800 }}
				/>
			</StyledDiv>
		</div>
	);
};

export default ProductListTable;
