import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

interface TransactionData {
  "Date": string;
  "Time": string;
  "Order No.": string;
  "Type": string;
  "Table": string;
  "Customer": string;
  "Items": string;
  "Item Count": number;
  "Status": string;
  "Total Amount": number;
  "Cost of Goods": number;
  "Gross Profit": number;
  "Profit %": string;
  "Void Reason": string;
}

export const exportTransactionsToExcel = (data: TransactionData[], activeTab: string) => {
  // Filter data based on status if needed
  const filteredData = data;
  
  // Calculate summary statistics
  const totalSales = filteredData.reduce((sum, row) => sum + row["Total Amount"], 0);
  const totalCost = filteredData.reduce((sum, row) => sum + row["Cost of Goods"], 0);
  const totalProfit = filteredData.reduce((sum, row) => sum + row["Gross Profit"], 0);
  const totalItems = filteredData.reduce((sum, row) => sum + row["Item Count"], 0);
  
  const completedSales = filteredData.filter(row => row.Status === "COMPLETED");
  const voidedSales = filteredData.filter(row => row.Status === "VOID");
  const parkedSales = filteredData.filter(row => row.Status === "PARKED");
  
  const completedTotal = completedSales.reduce((sum, row) => sum + row["Total Amount"], 0);
  const voidedTotal = voidedSales.reduce((sum, row) => sum + row["Total Amount"], 0);
  const parkedTotal = parkedSales.reduce((sum, row) => sum + row["Total Amount"], 0);

  // Create transactions worksheet
  const transactionsSheet = XLSX.utils.json_to_sheet(filteredData);
  
  // Auto-size columns for transactions
  transactionsSheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 15 }, // Order No
    { wch: 12 }, // Type
    { wch: 10 }, // Table
    { wch: 15 }, // Customer
    { wch: 40 }, // Items
    { wch: 12 }, // Item Count
    { wch: 12 }, // Status
    { wch: 15 }, // Total Amount
    { wch: 15 }, // Cost of Goods
    { wch: 15 }, // Gross Profit
    { wch: 10 }, // Profit %
    { wch: 30 }, // Void Reason
  ];

  // Create summary data
  const summaryData = [
    { "Metric": "Report Generated", "Value": dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { "Metric": "", "Value": "" },
    { "Metric": "=== OVERALL SUMMARY ===", "Value": "" },
    { "Metric": "Total Transactions", "Value": filteredData.length },
    { "Metric": "Total Items Sold", "Value": totalItems },
    { "Metric": "Total Sales Amount", "Value": totalSales.toFixed(2) },
    { "Metric": "Total Cost of Goods", "Value": totalCost.toFixed(2) },
    { "Metric": "Total Gross Profit", "Value": totalProfit.toFixed(2) },
    { "Metric": "Overall Profit Margin", "Value": totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(2) + "%" : "0%" },
    { "Metric": "", "Value": "" },
    { "Metric": "=== BY STATUS ===", "Value": "" },
    { "Metric": "Completed Transactions", "Value": completedSales.length },
    { "Metric": "Completed Sales Total", "Value": completedTotal.toFixed(2) },
    { "Metric": "", "Value": "" },
    { "Metric": "Voided Transactions", "Value": voidedSales.length },
    { "Metric": "Voided Sales Total", "Value": voidedTotal.toFixed(2) },
    { "Metric": "", "Value": "" },
    { "Metric": "Parked Transactions", "Value": parkedSales.length },
    { "Metric": "Parked Sales Total", "Value": parkedTotal.toFixed(2) },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Auto-size columns for summary
  summarySheet["!cols"] = [
    { wch: 30 }, // Metric
    { wch: 20 }, // Value
  ];

  // Create workbook and add sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

  // Generate filename with date and status filter
  const statusLabel = activeTab === "all" ? "All" : 
                      activeTab === "completed" ? "Completed" :
                      activeTab === "parked" ? "Parked" : "Voided";
  const filename = `Transactions_${statusLabel}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  // Export file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, filename);
};
