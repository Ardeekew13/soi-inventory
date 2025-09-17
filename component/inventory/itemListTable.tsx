"use client";
import { supabase } from "@/lib/supabase-client";
import { Item } from "@/lib/supabase.types";
import { formatPeso } from "@/utils/helper";
import { DeleteOutlined } from "@ant-design/icons";
import {
	Button,
	Input,
	Popconfirm,
	Space,
	Table,
	TableProps,
	Typography,
} from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { StyledDiv } from "../style";

interface IProps {
	data: Item[];
	loading: boolean;
	refetch: () => void;
	openModal: (record: Item) => void;
	messageApi: MessageInstance;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
	search: string;
}

const ItemListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch, search } =
		props;
	const warningItem = 20;
	const lowItem = 10;

	const handleDelete = async (id: string) => {
		const { error } = await supabase.from("items").delete().eq("id", id);

		if (error) {
			messageApi.error("Failed to delete item: " + error.message);
		} else {
			messageApi.success("Item deleted successfully");
			refetch();
		}
	};

	const columns: TableProps<Item>["columns"] = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			width: "50%",
		},

		{
			title: "Unit",
			dataIndex: "unit",
			key: "unit",
			width: "15%",
		},
		{
			title: "Current Stock",
			dataIndex: "current_stock",
			key: "current_stock",
			width: "10%",
			align: "right",
			render: (current_stock: number) => {
				return (
					<Typography.Text
						style={{
							color:
								current_stock <= lowItem
									? "red"
									: current_stock <= warningItem
									? "orange"
									: "",
						}}
					>
						{formatPeso(current_stock)}
					</Typography.Text>
				);
			},
		},
		{
			title: "Price (Per Unit)",
			dataIndex: "price_per_unit",
			key: "price_per_unit",
			align: "right",
			width: "15%",
			render: (price_per_unit: number) => {
				return formatPeso(price_per_unit);
			},
		},
		{
			title: "Actions",
			align: "center",
			width: "10%",
			fixed: "right",
			render: (_, record: Item) => {
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
					rowKey={(record: Item) => record.id.toString()}
					columns={columns}
					loading={loading}
					dataSource={data ?? ([] as Item[])}
					size="small"
					scroll={{ x: 800 }}
				/>
			</StyledDiv>
		</div>
	);
};

export default ItemListTable;
