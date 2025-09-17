"use client";
import { supabase } from "@/lib/supabase-client";
import { Product } from "@/lib/supabase.types";
import { formatPeso } from "@/utils/helper";
import { DeleteOutlined } from "@ant-design/icons";
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
}

const ProductListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch, search } =
		props;

	const handleDelete = async (id: string) => {
		const { error } = await supabase.from("products").delete().eq("id", id);

		if (error) {
			messageApi.error(error.message);
		} else {
			messageApi.success("Product deleted successfully");
			refetch();
		}
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
			render: (pricePerUnit: number) => `${formatPeso(pricePerUnit)}`,
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
						<Popconfirm
							title="Delete Item"
							description="Are you sure you want to delete this item?"
							onConfirm={() => handleDelete(record.id)}
							okText="Delete"
							cancelText="Cancel"
						>
							<DeleteOutlined style={{ color: "red" }} />
						</Popconfirm>
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
					rowKey={(record: Product) => record.id.toString()}
					columns={columns}
					loading={loading}
					dataSource={data ?? ([] as Product[])}
					size="small"
					scroll={{ x: 800 }}
				/>
			</StyledDiv>
		</div>
	);
};

export default ProductListTable;
