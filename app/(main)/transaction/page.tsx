"use client";
import CommonPageTitle from "@/component/common/CommonPageTitle";
import PageLayout from "@/component/common/custom-antd/PageContainer";
import ViewTransactionModal from "@/component/transaction/dialog/viewTransactionModal";
import TransactionListTable from "@/component/transaction/transactionListTable";
import { useRefetchFlag } from "@/context/TriggerRefetchContext";
import { Query, Sale, SaleItem } from "@/generated/graphql";
import { GET_SALES } from "@/graphql/inventory/transactions";
import { useModal } from "@/hooks/useModal";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { exportTransactionsToExcel } from "@/utils/export-transactions";
import { pesoFormatter } from "@/utils/helper";
import { useQuery } from "@apollo/client";
import { Button, message, Skeleton, Tabs } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const Transactions = () => {
  // Permission guard - will redirect if no access
  const { loading: permissionLoading, userPermissions } = usePermissionGuard({
    module: "transaction",
    action: "view",
  });

  const [messageApi, contextHolder] = message.useMessage();
  const { openModal, isModalOpen, closeModal, selectedRecord } = useModal();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { triggerRefetch, setTriggerRefetch } = useRefetchFlag();

  const { data, loading, refetch } = useQuery<Query>(GET_SALES, {
    variables: {
      search,
    },
    skip: permissionLoading, // Skip query while checking permissions
  });

  // Filter sales by status based on active tab
  const filteredSales = useMemo(() => {
    const allSales = data?.sales ?? [];

    switch (activeTab) {
      case "completed":
        return allSales.filter((sale: Sale) => sale.status === "COMPLETED");
      case "parked":
        return allSales.filter((sale: Sale) => sale.status === "PARKED");
      case "voided":
        return allSales.filter((sale: Sale) => sale.status === "VOID");
      case "refunds":
        return allSales.filter((sale: Sale) => sale.status === "REFUNDED");
      case "itemChanges":
        return allSales.filter((sale: Sale) => sale.status === "ITEM_CHANGED");
      default:
        return allSales;
    }
  }, [data?.sales, activeTab]);

  const tableProps = useMemo(
    () => ({
      data: filteredSales,
      loading,
      refetch,
      openModal,
      messageApi,
      setSearch,
      search,
      userPermissions,
    }),
    [filteredSales, loading, refetch, openModal, messageApi, setSearch, search, userPermissions]
  );

  const formattedData = filteredSales.map((sale: Sale) => {
    const itemList: string = (sale.saleItems as SaleItem[])
      .map(
        (i: SaleItem) => `${i?.product?.name} (x${i?.quantity})`
      )
      .join(", ");
    
    const itemCount = (sale.saleItems as SaleItem[]).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return {
      "Date": dayjs(sale.createdAt).format("YYYY-MM-DD"),
      "Time": dayjs(sale.createdAt).format("HH:mm:ss"),
      "Order No.": sale.orderNo || "N/A",
      "Type": sale.orderType || "N/A",
      "Table": sale.tableNumber || "N/A",
      "Customer": sale.customerName || "N/A",
      "Items": itemList,
      "Item Count": itemCount,
      "Status": sale.status,
      "Total Amount": sale.totalAmount,
      "Cost of Goods": sale.costOfGoods,
      "Gross Profit": sale.grossProfit,
      "Profit %": sale.totalAmount > 0 
        ? ((sale.grossProfit / sale.totalAmount) * 100).toFixed(2) + "%" 
        : "0%",
      "Void Reason": sale.voidReason || "",
    };
  });

  useEffect(() => {
    if (triggerRefetch) {
      refetch();
      setTriggerRefetch(false);
    }
  });

  // Show loading while checking permissions or fetching data
  if (permissionLoading || loading) {
    return <Skeleton active />;
  }

  return (
    <PageLayout
      title={
        <CommonPageTitle
          title="Transaction"
          subTitle="Your Complete Transaction Record"
        />
      }
      extra={
        userPermissions?.transaction?.includes('view') ? (
          <Button
            type="primary"
            onClick={() => exportTransactionsToExcel(formattedData ?? [], activeTab)}
          >
            Export to Excel
          </Button>
        ) : undefined
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            label: `All Transactions (${data?.sales?.length ?? 0})`,
            key: "all",
            children: <TransactionListTable {...tableProps} />,
          },
          {
            label: `Completed (${
              data?.sales?.filter((s: Sale) => s.status === "COMPLETED")
                .length ?? 0
            })`,
            key: "completed",
            children: <TransactionListTable {...tableProps} />,
          },
          {
            label: `Parked (${
              data?.sales?.filter((s: Sale) => s.status === "PARKED").length ??
              0
            })`,
            key: "parked",
            children: <TransactionListTable {...tableProps} />,
          },
          {
            label: `Voided (${
              data?.sales?.filter((s: Sale) => s.status === "VOID").length ?? 0
            })`,
            key: "voided",
            children: <TransactionListTable {...tableProps} />,
          },
          {
            label: `Refunds (${
              data?.sales?.filter((s: Sale) => s.status === "REFUNDED").length ?? 0
            })`,
            key: "refunds",
            children: <TransactionListTable {...tableProps} />,
          },
          {
            label: `Item Changes (${
              data?.sales?.filter((s: Sale) => s.status === "ITEM_CHANGED").length ?? 0
            })`,
            key: "itemChanges",
            children: <TransactionListTable {...tableProps} />,
          },
        ]}
      />

      {contextHolder}
      <ViewTransactionModal
        key={selectedRecord?.id}
        open={isModalOpen}
        onClose={closeModal}
        refetch={refetch}
        messageApi={messageApi}
        record={selectedRecord}
      />
    </PageLayout>
  );
};
export default Transactions;
