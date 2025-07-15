import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export const exportToExcel = (data: any[], filename = "report.xlsx") => {
	const worksheet = XLSX.utils.json_to_sheet(data);

	worksheet["!cols"] = Object.keys(data[0]).map((key) => ({
		wch: Math.max(
			key.length,
			...data.map((row) => (row[key] ? String(row[key]).length : 0))
		),
	}));

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

	const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

	const blob = new Blob([excelBuffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});

	saveAs(blob, filename);
};
