import { Sale, SaleWithItems } from "@/lib/supabase.types";
import { Cart, saleToCart } from "@/utils/carts";
import { Button, Table, TableProps, Tag } from "antd";
import dayjs from "dayjs";

interface IProps {
	sales: Sale[];
	setCart: React.Dispatch<React.SetStateAction<Cart>>;
	setDefaultTab: React.Dispatch<React.SetStateAction<string>>;
	setRecord: React.Dispatch<React.SetStateAction<Sale | undefined>>;
	setSelectedTableNo: React.Dispatch<React.SetStateAction<number | null>>;
	setSaleId: React.Dispatch<React.SetStateAction<string>>;
	setServiceType: React.Dispatch<React.SetStateAction<string | null>>;
}

const PosOrderListTable = (props: IProps) => {
	const {
		sales,
		setCart,
		setDefaultTab,
		setRecord,
		setSelectedTableNo,
		setSaleId,
		setServiceType,
	} = props;

	const handleViewOrder = (sale: SaleWithItems) => {
		console.log("sale", sale);
		setCart(saleToCart(sale));
		setSaleId(sale.id);
		setServiceType(sale.service_type);
		setSelectedTableNo(sale.table_no ?? null);
		setDefaultTab("carts");
		setRecord(sale);
	};

	const column: TableProps<SaleWithItems>["columns"] = [
		{
			title: "Order Number",
			dataIndex: "order_no",
			key: "order_no",
		},
		{
			title: "Table Number",
			dataIndex: "table_no",
			key: "table_no",
		},
		{
			title: "Order Date",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (createdAt: string) => {
				return dayjs(createdAt).format("MMM D, YYYY h:mm A");
			},
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status: string) => {
				if (status === "PARKED") {
					return <Tag color="blue">{status}</Tag>;
				} else if (status === "PAID") return <Tag color="green">{status}</Tag>;
				else if (status === "VOID") return <Tag color="red">{status}</Tag>;
			},
		},
		{
			title: "View",
			key: "view",
			render: (record: SaleWithItems) => {
				return (
					<Button
						type="link"
						size="small"
						onClick={() => handleViewOrder(record)}
					>
						View
					</Button>
				);
			},
		},
	];

	return (
		<div className="full">
			<Table
				rowKey={(record: SaleWithItems) => record?.id.toString()}
				columns={column}
				size="middle"
				bordered={false}
				dataSource={sales as SaleWithItems[]}
				pagination={{
					pageSize: 10,
				}}
			/>
		</div>
	);
};

export default PosOrderListTable;
