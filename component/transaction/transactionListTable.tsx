"use client";
import { useModal } from "@/hooks/useModal";
import { Sale } from "@/lib/supabase.types";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import dayjs from "dayjs";
import { StyledDiv } from "../style";
import VoidTransactionModal from "./dialog/voidModal";

interface IProps {
	data: Sale[];
	loading: boolean;
	refetch: () => void;
	messageApi: MessageInstance;
	openModal: (record: Sale) => void;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
	search: string;
}

const TransactionListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch, search } =
		props;
	const {
		isModalOpen: isModalVoidOpen,
		openModal: openModalVoid,
		closeModal,
		selectedRecord,
	} = useModal();
	const columns: TableProps<Sale>["columns"] = [
		{
			title: "Transaction Number",
			dataIndex: "order_no",
			key: "order_no",
			width: "15%",
		},
		{
			title: "Transaction Date",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (createdAt: string) => {
				return dayjs(createdAt).format("MM/DD/YYYY hh:mm A");
			},
		},
		{
			title: "Cost Of Goods",
			dataIndex: "cost_of_goods",
			key: "cost_of_goods",
			align: "right",
			width: "15%",
			render: (value: number) => value?.toFixed(2),
		},
		{
			title: "Total Amount",
			dataIndex: "total_amount",
			key: "total_amount",
			align: "right",
			render: (value: number) => value?.toFixed(2),
		},
		{
			title: "Gross Profit",
			dataIndex: "gross_profit",
			key: "gross_profit",
			align: "right",
			width: "15%",
			render: (value: number) => value?.toFixed(2),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: "10%",
			align: "center",
			render: (value: string) => {
				if (value === "VOID") {
					return <Tag color="red">{value}</Tag>;
				} else if (value === "PAID") return <Tag color="green">{value}</Tag>;
				else if (value === "PARKED") return <Tag color="blue">{value}</Tag>;
			},
		},

		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			width: "10%",
			align: "center",
			fixed: "right",
			render: (_, record: Sale) => {
				return (
					<Space
						style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
					>
						<Button type="link" size="small" onClick={() => openModal(record)}>
							View
						</Button>

						<DeleteOutlined
							style={{ color: "red" }}
							onClick={() => openModalVoid(record)}
						/>
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
				defaultValue={search}
				allowClear
			/>
			<StyledDiv>
				<Table
					rowKey={(record: Sale) => record.id.toString()}
					columns={columns}
					loading={loading}
					dataSource={data ?? ([] as Sale[])}
					size="small"
					scroll={{ x: 1000 }}
				/>
			</StyledDiv>
			<VoidTransactionModal
				messageApi={messageApi}
				refetch={refetch}
				open={isModalVoidOpen}
				onClose={closeModal}
				record={selectedRecord}
			/>
		</div>
	);
};

export default TransactionListTable;
