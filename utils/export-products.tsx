import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

interface ProductData {
  "Product Name": string;
  "Price": number;
  "Ingredients": string;
  "Total Ingredients": number;
  "Created Date": string;
  "Last Updated": string;
}

export const exportProductsToExcel = (products: any[]) => {
  // Format data for export
  const formattedData: ProductData[] = products.map(product => {
    const ingredientsList = product.ingredientsUsed
      ?.map((ing: any) => `${ing.item.name} (${ing.quantityUsed} ${ing.item.unit})`)
      .join(", ") || "No ingredients";

    return {
      "Product Name": product.name,
      "Price": product.price,
      "Ingredients": ingredientsList,
      "Total Ingredients": product.ingredientsUsed?.length || 0,
      "Created Date": dayjs(product.createdAt).format("YYYY-MM-DD"),
      "Last Updated": dayjs(product.updatedAt).format("YYYY-MM-DD HH:mm"),
    };
  });

  // Calculate summary statistics
  const totalProducts = formattedData.length;
  const avgPrice = formattedData.reduce((sum, p) => sum + p.Price, 0) / totalProducts;
  const maxPrice = Math.max(...formattedData.map(p => p.Price));
  const minPrice = Math.min(...formattedData.map(p => p.Price));
  const productsWithIngredients = formattedData.filter(p => p["Total Ingredients"] > 0).length;
  const productsWithoutIngredients = formattedData.filter(p => p["Total Ingredients"] === 0).length;

  // Create products worksheet
  const productsSheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Auto-size columns
  productsSheet["!cols"] = [
    { wch: 30 }, // Product Name
    { wch: 12 }, // Price
    { wch: 60 }, // Ingredients
    { wch: 18 }, // Total Ingredients
    { wch: 15 }, // Created Date
    { wch: 20 }, // Last Updated
  ];

  // Create summary data
  const summaryData = [
    { "Metric": "Report Generated", "Value": dayjs().format("YYYY-MM-DD HH:mm:ss") },
    { "Metric": "", "Value": "" },
    { "Metric": "=== PRODUCT SUMMARY ===", "Value": "" },
    { "Metric": "Total Products", "Value": totalProducts },
    { "Metric": "Products with Ingredients", "Value": productsWithIngredients },
    { "Metric": "Products without Ingredients", "Value": productsWithoutIngredients },
    { "Metric": "", "Value": "" },
    { "Metric": "=== PRICING ===", "Value": "" },
    { "Metric": "Average Price", "Value": `₱${avgPrice.toFixed(2)}` },
    { "Metric": "Highest Price", "Value": `₱${maxPrice.toFixed(2)}` },
    { "Metric": "Lowest Price", "Value": `₱${minPrice.toFixed(2)}` },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Auto-size columns for summary
  summarySheet["!cols"] = [
    { wch: 30 }, // Metric
    { wch: 25 }, // Value
  ];

  // Create detailed ingredients sheet
  const detailedIngredientsData: any[] = [];
  products.forEach(product => {
    if (product.ingredientsUsed && product.ingredientsUsed.length > 0) {
      product.ingredientsUsed.forEach((ing: any) => {
        detailedIngredientsData.push({
          "Product Name": product.name,
          "Product Price": product.price,
          "Ingredient": ing.item.name,
          "Quantity Used": ing.quantityUsed,
          "Unit": ing.item.unit,
          "Price Per Unit": ing.item.pricePerUnit,
          "Ingredient Cost": (ing.quantityUsed * ing.item.pricePerUnit).toFixed(2),
        });
      });
    }
  });

  const ingredientsSheet = XLSX.utils.json_to_sheet(detailedIngredientsData);
  ingredientsSheet["!cols"] = [
    { wch: 30 }, // Product Name
    { wch: 15 }, // Product Price
    { wch: 25 }, // Ingredient
    { wch: 15 }, // Quantity Used
    { wch: 12 }, // Unit
    { wch: 15 }, // Price Per Unit
    { wch: 15 }, // Ingredient Cost
  ];

  // Create workbook and add sheets
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");
  if (detailedIngredientsData.length > 0) {
    XLSX.utils.book_append_sheet(workbook, ingredientsSheet, "Ingredients Detail");
  }

  // Generate filename with date
  const filename = `Products_Report_${dayjs().format("YYYY-MM-DD")}.xlsx`;

  // Export file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  saveAs(blob, filename);
};
