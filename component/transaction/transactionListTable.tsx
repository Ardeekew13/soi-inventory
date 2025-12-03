"use client";
import { Sale } from "@/generated/graphql";
import { useModal } from "@/hooks/useModal";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { StyledDiv } from "../style";
import VoidTransactionModal from "./dialog/voidModal";
import { pesoFormatter, dateFormatterWithTime } from "@/utils/helper";

interface IProps {
	data: Sale[];
	loading: boolean;
	refetch: () => void;
	messageApi: MessageInstance;
	openModal: (record: Sale) => void;
	setSearch: React.Dispatch<React.SetStateAction<string>>;
	search: string;
	userPermissions?: Record<string, string[]>;
}

const TransactionListTable = (props: IProps) => {
	const { data, loading, refetch, openModal, messageApi, setSearch, search, userPermissions } =
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
			width: 200,
		},
		{
			title: "Transaction Date",
			dataIndex: "createdAt",
			key: "createdAt",
			width: 200,
			render: (createdAt: string) => {
				return dateFormatterWithTime(createdAt);
			},
		},
		{
			title: "Cost Of Goods",
			dataIndex: "costOfGoods",
			key: "costOfGoods",
			width: 150,
			align: "right",
			render: (value: number) => pesoFormatter(value),
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			width: 150,
			align: "right",
			render: (value: number) => pesoFormatter(value),
		},
		{
			title: "Gross Profit",
			dataIndex: "grossProfit",
			key: "grossProfit",
			width: 150,
			align: "right",
			render: (value: number) => pesoFormatter(value),
		},

		{
			title: "Action",
			dataIndex: "action",
			key: "action",
			width: 120,
			align: "center",
			fixed: "right",
			render: (_, record: Sale) => {
				return (
					<Space
						style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
					>
						{userPermissions?.transaction?.includes('view') && (
							<Button type="link" size="small" onClick={() => openModal(record)}>
								View
							</Button>
						)}

						{userPermissions?.transaction?.includes('void') && (
							<DeleteOutlined
								style={{ color: "red" }}
								onClick={() => openModalVoid(record)}
							/>
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
				defaultValue={search}
				allowClear
			/>
			<StyledDiv>
				<Table
					rowKey={(record: Sale) => record._id.toString()}
					columns={columns}
					loading={loading}
					dataSource={data ?? ([] as Sale[])}
					size="middle"
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
