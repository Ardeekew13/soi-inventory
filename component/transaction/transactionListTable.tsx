"use client";
import { Sale } from "@/generated/graphql";
import { useModal } from "@/hooks/useModal";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
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
			dataIndex: "orderNo",
			key: "orderNo",
			width: "10%",
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
			dataIndex: "costOfGoods",
			key: "costOfGoods",
			width: "15%",
			render: (value: number) => value?.toFixed(2),
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (value: number) => value?.toFixed(2),
		},
		{
			title: "Gross Profit",
			dataIndex: "grossProfit",
			key: "grossProfit",
			width: "15%",
			render: (value: number) => value?.toFixed(2),
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
