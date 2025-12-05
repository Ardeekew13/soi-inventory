import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

interface InventoryItemData {
  "Item Name": string;
  "Current Stock": number;
  "Unit": string;
  "Price Per Unit": number;
  "Total Value": number;
  "Stock Status": string;
  "Created Date": string;
  "Last Updated": string;
}

export const exportInventoryToExcel = (items: any[]) => {
  // Format data for export
  const formattedData: InventoryItemData[] = items.map(item => {
    const totalValue = item.currentStock * item.pricePerUnit;
    let stockStatus = "In Stock";
    
    // Determine stock status (you can adjust thresholds as needed)
    if (item.currentStock === 0) {
      stockStatus = "Out of Stock";
    } else if (item.currentStock < 10) {
      stockStatus = "Low Stock";
    }

    return {
      "Item Name": item.name,
      "Current Stock": item.currentStock,
      "Unit": item.unit,
      "Price Per Unit": item.pricePerUnit,
      "Total Value": parseFloat(totalValue.toFixed(2)),
      "Stock Status": stockStatus,
      "Created Date": dayjs(item.createdAt).format("YYYY-MM-DD"),
      "Last Updated": dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm"),
    };
  });

  // Calculate summary statistics
  const totalItems = formattedData.length;
  const totalStockValue = formattedData.reduce((sum, item) => sum + item["Total Value"], 0);
  const outOfStock = formattedData.filter(item => item["Stock Status"] === "Out of Stock").length;
  const lowStock = formattedData.filter(item => item["Stock Status"] === "Low Stock").length;
  const inStock = formattedData.filter(item => item["Stock Status"] === "In Stock").length;

  // Create items worksheet
  const itemsSheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Auto-size columns
  itemsSheet["!cols"] = [
    { wch: 30 }, // Item Name
    { wch: 15 }, // Current Stock
    { wch: 12 }, // Unit
    { wch: 15 }, // Price Per Unit
    { wch: 15 }, // Total Value
    { wch: 15 }, // Stock Status
    { wch: 15 }, // Created Date
    { wch: 20 }, // Last Updated
  ];

  // Create summary data
  const summaryData = [
    { "Metric": "Report Generated", "Value": dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { "Metric": "", "Value": "" },
    { "Metric": "=== INVENTORY SUMMARY ===", "Value": "" },
    { "Metric": "Total Items", "Value": totalItems },
    { "Metric": "Total Stock Value", "Value": `₱${totalStockValue.toFixed(2)}` },
    { "Metric": "", "Value": "" },
    { "Metric": "=== STOCK STATUS ===", "Value": "" },
    { "Metric": "In Stock", "Value": inStock },
    { "Metric": "Low Stock", "Value": lowStock },
    { "Metric": "Out of Stock", "Value": outOfStock },
    { "Metric": "", "Value": "" },
    { "Metric": "=== NOTES ===", "Value": "" },
    { "Metric": "Low Stock Threshold", "Value": "< 10 units" },
    { "Metric": "Out of Stock", "Value": "0 units" },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Auto-size columns for summary
  summarySheet["!cols"] = [
    { wch: 30 }, // Metric
    { wch: 25 }, // Value
  ];

  // Create workbook and add sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, itemsSheet, "Inventory Items");

  // Generate filename with date
  const filename = `Inventory_Report_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  // Export file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, filename);
};
