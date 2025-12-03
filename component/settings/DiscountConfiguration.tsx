"use client";
import { Discount, Mutation, Query } from "@/generated/graphql";
import {
	CREATE_DISCOUNT,
	DELETE_DISCOUNT,
	GET_DISCOUNTS,
	UPDATE_DISCOUNT,
} from "@/graphql/settings/settings";
import { dateFormatterWithTime } from "@/utils/helper";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { TableProps } from "antd/lib";
import { useState } from "react";
import AddDiscountDialog from "./dialog/addDiscountDialog";
import { StyledDiv } from "../style";

const DiscountConfiguration = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<Discount | null>(null);

	const { data, loading, refetch } = useQuery<Query>(GET_DISCOUNTS);

	const [deleteDiscount] = useMutation<Mutation>(DELETE_DISCOUNT, {
		onCompleted: (data) => {
			if (data?.deleteDiscount?.success) {
				messageApi.success(data?.deleteDiscount?.message);
				refetch();
			} else {
				messageApi.error(data?.deleteDiscount?.message || "Failed to delete");
			}
		},
		onError: () => {
			messageApi.error("An error occurred while deleting discount");
		},
	});

	const handleDelete = (id: string) => {
		deleteDiscount({
			variables: { id },
		});
	};

	const handleEdit = (record: Discount) => {
		setSelectedRecord(record);
		setIsModalOpen(true);
	};

	const handleAdd = () => {
		setSelectedRecord(null);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedRecord(null);
	};

	const columns: TableProps<Discount>["columns"] = [
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
			width: "40%",
		},
		{
			title: "Value",
			dataIndex: "value",
			key: "value",
			width: "20%",
			align: "right",
			render: (value: number) => `${value}%`,
		},
		{
			title: "Created At",
			dataIndex: "createdAt",
			key: "createdAt",
			width: "20%",
			render: (date: string) => dateFormatterWithTime(date),
		},
		{
			title: "Actions",
			key: "actions",
			width: "20%",
			align: "center",
			fixed: "right",
			render: (_, record: Discount) => (
				<Space>
					<Button
						type="link"
						size="small"
						icon={<EditOutlined />}
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Popconfirm
						title="Delete Discount"
						description="Are you sure you want to delete this discount?"
						onConfirm={() => handleDelete(record._id)}
						okText="Yes"
						cancelText="No"
					>
						<Button type="link" danger size="small" icon={<DeleteOutlined />}>
							Delete
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="w-full">
			{contextHolder}
			<div style={{ marginBottom: 16, textAlign: "right" }}>
				<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
					Add Discount
				</Button>
			</div>
			<StyledDiv>
				<Table
					rowKey={(record: Discount) => record._id.toString()}
					columns={columns}
					dataSource={data?.discounts ?? []}
					loading={loading}
					size="middle"
					scroll={{ x: 800 }}
				/>
			</StyledDiv>
			{isModalOpen && (
				<AddDiscountDialog
					open={isModalOpen}
					onClose={handleCloseModal}
					refetch={refetch}
					messageApi={messageApi}
					record={selectedRecord}
				/>
			)}
		</div>
	);
};

export default DiscountConfiguration;
