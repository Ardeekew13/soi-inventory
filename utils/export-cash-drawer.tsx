import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

interface CashDrawerTransaction {
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    username: string;
  };
}

interface CashDrawerData {
  _id: string;
  openedBy: string;
  openedAt: string;
  closedBy?: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  currentBalance?: number;
  totalSales: number;
  totalCashIn: number;
  totalCashOut: number;
  status: string;
  transactions: CashDrawerTransaction[];
}

export const exportCashDrawerToExcel = (drawer: CashDrawerData) => {
  // Prepare summary data
  const summaryData = [
    { "Field": "Report Generated", "Value": dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { "Field": "", "Value": "" },
    { "Field": "=== CASH DRAWER INFORMATION ===", "Value": "" },
    { "Field": "Status", "Value": drawer.status },
    { "Field": "Opened By", "Value": drawer.openedBy },
    { "Field": "Opened At", "Value": dayjs(parseInt(drawer.openedAt)).format("MMM D, YYYY h:mm A") },
    { "Field": "Closed By", "Value": drawer.closedBy || "N/A" },
    { "Field": "Closed At", "Value": drawer.closedAt ? dayjs(parseInt(drawer.closedAt)).format("MMM D, YYYY h:mm A") : "N/A" },
    { "Field": "", "Value": "" },
    { "Field": "=== FINANCIAL SUMMARY ===", "Value": "" },
    { "Field": "Opening Balance", "Value": drawer.openingBalance.toFixed(2) },
    { "Field": "Total Sales", "Value": drawer.totalSales.toFixed(2) },
    { "Field": "Total Cash In", "Value": drawer.totalCashIn.toFixed(2) },
    { "Field": "Total Cash Out", "Value": drawer.totalCashOut.toFixed(2) },
    { "Field": "Expected Balance", "Value": drawer.expectedBalance?.toFixed(2) || drawer.currentBalance?.toFixed(2) || "N/A" },
    { "Field": "Actual Closing Balance", "Value": drawer.closingBalance?.toFixed(2) || "N/A" },
  ];

  // Add difference if closed
  if (drawer.status === "CLOSED" && drawer.closingBalance !== undefined && drawer.expectedBalance !== undefined) {
    const difference = drawer.closingBalance - drawer.expectedBalance;
    summaryData.push(
      { "Field": "Difference (Over/Short)", "Value": difference.toFixed(2) },
      { "Field": "Status", "Value": difference === 0 ? "Balanced" : (difference > 0 ? "Overage" : "Shortage") }
    );
  }

  // Prepare transactions data
  const transactionsData = drawer.transactions.map((txn) => {
    const userName = txn.user
      ? `${txn.user.firstName || ""} ${txn.user.lastName || ""}`.trim() || txn.user.username
      : "System";

    return {
      "Date": dayjs(parseInt(txn.createdAt)).format("YYYY-MM-DD"),
      "Time": dayjs(parseInt(txn.createdAt)).format("HH:mm:ss"),
      "Type": txn.type,
      "Description": txn.description,
      "Amount": txn.amount,
      "User": userName,
    };
  });

  // Calculate transaction type totals
  const transactionStats = [
    { "Field": "", "Value": "" },
    { "Field": "=== TRANSACTION BREAKDOWN ===", "Value": "" },
    { "Field": "Total Transactions", "Value": drawer.transactions.length.toString() },
    { "Field": "Opening Transactions", "Value": drawer.transactions.filter(t => t.type === "OPENING").length.toString() },
    { "Field": "Sales Transactions", "Value": drawer.transactions.filter(t => t.type === "SALE").length.toString() },
    { "Field": "Cash In Transactions", "Value": drawer.transactions.filter(t => t.type === "CASH_IN").length.toString() },
    { "Field": "Cash Out Transactions", "Value": drawer.transactions.filter(t => t.type === "CASH_OUT").length.toString() },
    { "Field": "Closing Transactions", "Value": drawer.transactions.filter(t => t.type === "CLOSING").length.toString() },
  ];

  // Add transaction stats to summary
  summaryData.push(...transactionStats);

  // Create summary worksheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [
    { wch: 30 }, // Field
    { wch: 30 }, // Value
  ];

  // Create transactions worksheet
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  transactionsSheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 15 }, // Type
    { wch: 40 }, // Description
    { wch: 15 }, // Amount
    { wch: 20 }, // User
  ];

  // Create workbook and add sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

  // Generate filename with date and time
  const filename = `CashDrawer_${drawer.status}_${dayjs(parseInt(drawer.openedAt)).format("YYYYMMDD_HHmmss")}.xlsx`;

  // Generate and download file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, filename);
};

export const exportCashDrawerHistoryToExcel = (drawers: CashDrawerData[]) => {
  // Prepare history data
  const historyData = drawers.map((drawer) => {
    const difference = drawer.status === "CLOSED" && drawer.closingBalance !== undefined && drawer.expectedBalance !== undefined
      ? drawer.closingBalance - drawer.expectedBalance
      : 0;

    return {
      "Opened At": dayjs(parseInt(drawer.openedAt)).format("YYYY-MM-DD HH:mm:ss"),
      "Closed At": drawer.closedAt ? dayjs(parseInt(drawer.closedAt)).format("YYYY-MM-DD HH:mm:ss") : "N/A",
      "Opened By": drawer.openedBy,
      "Closed By": drawer.closedBy || "N/A",
      "Opening Balance": drawer.openingBalance,
      "Total Sales": drawer.totalSales,
      "Total Cash In": drawer.totalCashIn,
      "Total Cash Out": drawer.totalCashOut,
      "Expected Balance": drawer.expectedBalance || 0,
      "Actual Balance": drawer.closingBalance || 0,
      "Difference": difference,
      "Status": drawer.status,
    };
  });

  // Calculate overall statistics
  const totalDrawers = drawers.length;
  const totalSales = drawers.reduce((sum, d) => sum + d.totalSales, 0);
  const totalCashIn = drawers.reduce((sum, d) => sum + d.totalCashIn, 0);
  const totalCashOut = drawers.reduce((sum, d) => sum + d.totalCashOut, 0);
  const totalDifference = drawers.reduce((sum, d) => {
    if (d.status === "CLOSED" && d.closingBalance !== undefined && d.expectedBalance !== undefined) {
      return sum + (d.closingBalance - d.expectedBalance);
    }
    return sum;
  }, 0);

  const summaryData = [
    { "Metric": "Report Generated", "Value": dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { "Metric": "", "Value": "" },
    { "Metric": "=== OVERALL SUMMARY ===", "Value": "" },
    { "Metric": "Total Drawers", "Value": totalDrawers },
    { "Metric": "Total Sales", "Value": totalSales.toFixed(2) },
    { "Metric": "Total Cash In", "Value": totalCashIn.toFixed(2) },
    { "Metric": "Total Cash Out", "Value": totalCashOut.toFixed(2) },
    { "Metric": "Total Difference", "Value": totalDifference.toFixed(2) },
    { "Metric": "Average Sales per Drawer", "Value": totalDrawers > 0 ? (totalSales / totalDrawers).toFixed(2) : "0.00" },
  ];

  // Create summary worksheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [
    { wch: 30 }, // Metric
    { wch: 20 }, // Value
  ];

  // Create history worksheet
  const historySheet = XLSX.utils.json_to_sheet(historyData);
  historySheet["!cols"] = [
    { wch: 20 }, // Opened At
    { wch: 20 }, // Closed At
    { wch: 20 }, // Opened By
    { wch: 20 }, // Closed By
    { wch: 15 }, // Opening Balance
    { wch: 15 }, // Total Sales
    { wch: 15 }, // Total Cash In
    { wch: 15 }, // Total Cash Out
    { wch: 15 }, // Expected Balance
    { wch: 15 }, // Actual Balance
    { wch: 15 }, // Difference
    { wch: 12 }, // Status
  ];

  // Create workbook and add sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, historySheet, "History");

  // Generate filename with date
  const filename = `CashDrawer_History_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;

  // Generate and download file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(data, filename);
};
