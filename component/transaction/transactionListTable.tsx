"use client";
import { Sale } from "@/generated/graphql";
import { useModal } from "@/hooks/useModal";
import { DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { TableProps } from "antd/lib";
import { StyledDiv } from "../style";
import VoidTransactionModal from "./dialog/voidModal";
import ChangeItemModal from "./dialog/changeItemModal";
import { pesoFormatter, dateFormatterWithTime } from "@/utils/helper";
import { useState } from "react";

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
		closeModal: closeVoidModal,
		selectedRecord: voidRecord,
	} = useModal();

	const [changeItemModalOpen, setChangeItemModalOpen] = useState(false);
	const [changeItemRecord, setChangeItemRecord] = useState<Sale | null>(null);

	const handleOpenChangeItem = (record: Sale) => {
		setChangeItemRecord(record);
		setChangeItemModalOpen(true);
	};

	const handleCloseChangeItem = () => {
		setChangeItemModalOpen(false);
		setChangeItemRecord(null);
	};
	const columns: TableProps<Sale>["columns"] = [
		{
			title: "Transaction Number",
			dataIndex: "orderNo",
			key: "orderNo",
			width: 180,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status: string) => {
				let color = "green";
				if (status === "VOID") color = "red";
				if (status === "PARKED") color = "orange";
				return <Tag color={color}>{status}</Tag>;
			},
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
			width: 200,
			align: "center",
			fixed: "right",
			render: (_, record: Sale) => {
				const isCompleted = record.status === "COMPLETED";
				const isVoided = record.status === "VOID";
				
				return (
					<Space
						style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
					>
						{userPermissions?.transaction?.includes('view') && (
							<Button type="link" size="small" onClick={() => openModal(record)}>
								View
							</Button>
						)}

						{isCompleted && userPermissions?.transaction?.includes('changeItem') && (
							<Button 
								type="link" 
								size="small" 
								icon={<SwapOutlined />}
								onClick={() => handleOpenChangeItem(record)}
							>
								Change
							</Button>
						)}

						{!isVoided && (userPermissions?.transaction?.includes('void') || userPermissions?.transaction?.includes('refund')) && (
							<Button
								type="link"
								danger
								size="small"
								icon={<DeleteOutlined />}
								onClick={() => openModalVoid(record)}
							>
								{isCompleted ? "Refund" : "Void"}
							</Button>
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
				onClose={closeVoidModal}
				record={voidRecord}
			/>
			{changeItemRecord && (
				<ChangeItemModal
					messageApi={messageApi}
					refetch={refetch}
					open={changeItemModalOpen}
					onClose={handleCloseChangeItem}
					record={changeItemRecord}
				/>
			)}
		</div>
	);
};

export default TransactionListTable;
