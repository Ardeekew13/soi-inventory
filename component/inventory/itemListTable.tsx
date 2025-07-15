"use client";
import { Item, Mutation } from "@/generated/graphql";
import { DELETE_ITEM } from "@/graphql/inventory/items";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
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
}

const ItemListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch } = props;
	const warningItem = 20;
	const lowItem = 10;

	const [deleteItem, { loading: deleteLoading }] = useMutation<Mutation>(
		DELETE_ITEM,
		{
			onCompleted: (data) => {
				if (data?.deleteItem?.success) {
					messageApi.success("Item deleted successfully");
					refetch();
				} else {
					messageApi.error(data?.deleteItem?.message);
				}
			},
		}
	);

	const handleDelete = (id: string) => {
		deleteItem({
			variables: {
				id,
			},
		});
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
			dataIndex: "currentStock",
			key: "currentStock",
			width: "10%",
			render: (currentStock: number) => {
				return (
					<Typography.Text
						style={{
							color:
								currentStock <= lowItem
									? "red"
									: currentStock <= warningItem
									? "orange"
									: "",
						}}
					>
						{currentStock.toFixed(2)}
					</Typography.Text>
				);
			},
		},
		{
			title: "Price (Per Unit)",
			dataIndex: "pricePerUnit",
			key: "pricePerUnit",
			align: "right",
			width: "15%",
			render: (pricePerUnit: number) => `₱${pricePerUnit.toFixed(2)}`,
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
			/>
			<StyledDiv>
				<Table
					rowKey={(record: Item) => record.id.toString()}
					columns={columns}
					loading={loading || deleteLoading}
					dataSource={data ?? ([] as Item[])}
					size="small"
					scroll={{ x: 800 }}
				/>
			</StyledDiv>
		</div>
	);
};

export default ItemListTable;
