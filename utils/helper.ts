import { Product } from "@/generated/graphql";
import dayjs from "dayjs";

export const responsiveColumn24 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 24,
	xl: 24,
};

export const responsiveColumn18 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 18,
	xl: 18,
};

export const responsiveColumn12 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 12,
};

export const responsiveColumn8 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 8,
};

export const responsiveColumn6 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 6,
};

export const responsiveColumn4 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 4,
};

export const responsiveColumn3 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 3,
};

export const requiredField = [
	{
		required: true,
		message: "This field is required!",
	},
];

export interface CartProduct extends Product {
	quantity: number;
	quantityUsed?: number;
	quantityPrinted?: number;
}

/**
 * Formats a number as Philippine Peso currency
 * Rounds to 2 decimal places (safest for money)
 * @param value - The numeric value to format
 * @returns Formatted string with ₱ symbol (e.g., "₱1,234.56")
 */
export const pesoFormatter = (value: number | string | undefined | null): string => {
	if (value === undefined || value === null || value === "") {
		return "₱0.00";
	}
	
	const numValue = typeof value === "string" ? parseFloat(value) : value;
	
	if (isNaN(numValue)) {
		return "₱0.00";
	}
	
	// Round to 2 decimal places for money safety
	const rounded = Math.round(numValue * 100) / 100;
	
	// Format with comma separators and 2 decimal places
	return `₱${rounded.toLocaleString("en-PH", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
};

/**
 * Formats a date with time in MM/DD/YYYY h:mm A format
 * Handles both ISO date strings and timestamp strings
 * @param date - Date string (ISO format or timestamp as string)
 * @returns Formatted date string (e.g., "11/20/2025 2:59 PM")
 */
export const dateFormatterWithTime = (date: string | number | undefined | null): string => {
	if (!date) {
		return "";
	}
	
	// Convert string timestamps to numbers
	const dateValue = typeof date === "string" && !isNaN(Number(date)) 
		? Number(date) 
		: date;
	
	return dayjs(dateValue).format("MM/DD/YYYY h:mm A");
};

/**
 * Formats a date without time in MM/DD/YYYY format
 * Handles both ISO date strings and timestamp strings
 * @param date - Date string (ISO format or timestamp as string)
 * @returns Formatted date string (e.g., "11/20/2025")
 */
export const dateFormatter = (date: string | number | undefined | null): string => {
	if (!date) {
		return "";
	}
	
	// Convert string timestamps to numbers
	const dateValue = typeof date === "string" && !isNaN(Number(date)) 
		? Number(date) 
		: date;
	
	return dayjs(dateValue).format("MM/DD/YYYY");
};

/**
 * Formats a date with time for exports in YYYY-MM-DD HH:mm format
 * Handles both ISO date strings and timestamp strings
 * @param date - Date string (ISO format or timestamp as string)
 * @returns Formatted date string (e.g., "2025-11-20 14:59")
 */
export const dateFormatterForExport = (date: string | number | undefined | null): string => {
	if (!date) {
		return "";
	}
	
	// Convert string timestamps to numbers
	const dateValue = typeof date === "string" && !isNaN(Number(date)) 
		? Number(date) 
		: date;
	
	return dayjs(dateValue).format("YYYY-MM-DD HH:mm");
};

/**
 * Formats a date with full month name in MMMM DD, YYYY format
 * Handles both ISO date strings and timestamp strings
 * @param date - Date string (ISO format or timestamp as string)
 * @returns Formatted date string (e.g., "November 20, 2025")
 */
export const dateFormatterWithMonth = (date: string | number | undefined | null): string => {
	if (!date) {
		return "";
	}
	
	// Convert string timestamps to numbers
	const dateValue = typeof date === "string" && !isNaN(Number(date)) 
		? Number(date) 
		: date;
	
	return dayjs(dateValue).format("MMMM DD, YYYY");
};

/**
 * Formats a date with full month name and time in MMMM DD, YYYY hh:mm:ss A format
 * Handles both ISO date strings and timestamp strings
 * @param date - Date string (ISO format or timestamp as string)
 * @returns Formatted date string (e.g., "November 20, 2025 02:59:30 PM")
 */
export const dateFormatterWithMonthAndTime = (date: string | number | undefined | null): string => {
	if (!date) {
		return "";
	}
	
	// Convert string timestamps to numbers
	const dateValue = typeof date === "string" && !isNaN(Number(date)) 
		? Number(date) 
		: date;
	
	return dayjs(dateValue).format("MMMM DD, YYYY hh:mm:ss A");
};
